-- Additive car cleaning history. Apply only after the category enum migration commits.
-- Raw snapshots are private. Anonymous reads must use the sanitized edge projection.
-- No expiry job is defined: retained_until is a minimum policy floor, not a purge date.
CREATE TABLE public.car_cleaning_passport_archives (
  passport_id uuid PRIMARY KEY,
  archive_id uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  user_id uuid NOT NULL,
  public_slug text NOT NULL UNIQUE CHECK (public_slug ~ '^([a-f0-9]{8}|[a-f0-9]{16}|[a-f0-9]{32})$'),
  product_identifier text GENERATED ALWAYS AS ('urn:uuid:' || archive_id::text) STORED NOT NULL,
  latest_version bigint NOT NULL DEFAULT 0 CHECK (latest_version >= 0),
  retained_until timestamptz NOT NULL,
  withdrawn_at timestamptz,
  guarded_model_definition jsonb CHECK (guarded_model_definition IS NULL OR jsonb_typeof(guarded_model_definition) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Deliberately no passport or auth-user foreign keys: deletion must not cascade here.
CREATE TABLE public.car_cleaning_passport_versions (
  passport_id uuid NOT NULL,
  user_id uuid NOT NULL,
  version bigint NOT NULL CHECK (version > 0),
  recorded_at timestamptz NOT NULL,
  snapshot jsonb NOT NULL CHECK (jsonb_typeof(snapshot) = 'object'),
  PRIMARY KEY (passport_id, version)
);
CREATE INDEX car_cleaning_archive_owner ON public.car_cleaning_passport_archives (user_id);
CREATE INDEX car_cleaning_version_owner ON public.car_cleaning_passport_versions (user_id, passport_id, version DESC);

ALTER TABLE public.car_cleaning_passport_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_cleaning_passport_versions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.car_cleaning_passport_archives, public.car_cleaning_passport_versions FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON public.car_cleaning_passport_archives, public.car_cleaning_passport_versions TO authenticated, service_role;
CREATE POLICY "Owners can read retained car cleaning metadata"
  ON public.car_cleaning_passport_archives FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners can read retained private car cleaning snapshots"
  ON public.car_cleaning_passport_versions FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE FUNCTION public.car_cleaning_history_immutable()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  RAISE EXCEPTION 'Car cleaning passport history is immutable' USING ERRCODE = '23514';
END;
$$;
CREATE TRIGGER car_cleaning_versions_immutable
  BEFORE UPDATE OR DELETE ON public.car_cleaning_passport_versions
  FOR EACH ROW EXECUTE FUNCTION public.car_cleaning_history_immutable();

-- Invalid or absent supplier dates use the save time. Future placement dates extend
-- the floor; earlier corrections cannot shorten it. UTC avoids session timezone drift.
CREATE FUNCTION public.car_cleaning_retention_floor(data jsonb, saved_at timestamptz)
RETURNS timestamptz LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE
  raw_date text := data ->> 'last_placed_on_market_date';
  placement date;
BEGIN
  IF raw_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN
    BEGIN
      placement := make_date(split_part(raw_date, '-', 1)::integer,
                             split_part(raw_date, '-', 2)::integer,
                             split_part(raw_date, '-', 3)::integer);
    EXCEPTION WHEN datetime_field_overflow OR invalid_datetime_format THEN
      placement := NULL;
    END;
  END IF;
  RETURN (greatest(saved_at AT TIME ZONE 'UTC', placement::timestamp) + interval '10 years') AT TIME ZONE 'UTC';
END;
$$;

-- Public revision references identify a supplier-assessed model without storing its formula.
-- Null/empty legacy values remain fillable once, then become part of the fixed definition.
CREATE FUNCTION public.car_cleaning_model_definition(data jsonb)
RETURNS jsonb LANGUAGE sql IMMUTABLE SET search_path = '' AS $$
  SELECT jsonb_strip_nulls(jsonb_build_object(
    'product_name', nullif(data ->> 'product_name', ''),
    'model_identifier', nullif(data ->> 'model_identifier', ''),
    'manufacturer_operator_id', nullif(data ->> 'manufacturer_operator_id', ''),
    'model_content_reference', nullif(data ->> 'model_content_reference', ''),
    'manufacturing_process_reference', nullif(data ->> 'manufacturing_process_reference', ''),
    'clp_classification', nullif(data ->> 'clp_classification', '')
  ));
$$;

CREATE FUNCTION public.guard_car_cleaning_passport_identity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  reserved public.car_cleaning_passport_archives%ROWTYPE;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.category::text = 'car_cleaning' THEN
    IF NEW.id IS DISTINCT FROM OLD.id OR NEW.user_id IS DISTINCT FROM OLD.user_id
      OR NEW.category IS DISTINCT FROM OLD.category OR NEW.public_slug IS DISTINCT FROM OLD.public_slug THEN
      RAISE EXCEPTION 'Car cleaning passport identity and public URI cannot change; create a new passport' USING ERRCODE = '23514';
    END IF;
    SELECT * INTO reserved FROM public.car_cleaning_passport_archives WHERE passport_id = OLD.id;
    IF reserved.guarded_model_definition IS NOT NULL AND EXISTS (
      SELECT 1 FROM jsonb_each(reserved.guarded_model_definition) AS protected(key, value)
      WHERE (NEW.category_data -> protected.key) IS DISTINCT FROM protected.value
    ) THEN
      RAISE EXCEPTION 'The retained Annex VI product model cannot change; create a new passport' USING ERRCODE = '23514';
    END IF;
  END IF;
  -- Reserve retained car URIs even if a later write tries to assign one to another category.
  SELECT * INTO reserved FROM public.car_cleaning_passport_archives WHERE public_slug = NEW.public_slug;
  IF FOUND AND (reserved.passport_id IS DISTINCT FROM NEW.id OR reserved.withdrawn_at IS NOT NULL) THEN
    RAISE EXCEPTION 'This public URI is reserved for a retained car cleaning passport' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_car_cleaning_passport_identity
  BEFORE INSERT OR UPDATE ON public.passports
  FOR EACH ROW EXECUTE FUNCTION public.guard_car_cleaning_passport_identity();

CREATE FUNCTION public.capture_car_cleaning_passport_version()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  saved_at timestamptz := clock_timestamp();
  archive public.car_cleaning_passport_archives%ROWTYPE;
  new_version bigint;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.category::text = 'car_cleaning' THEN
      UPDATE public.car_cleaning_passport_archives
      SET withdrawn_at = coalesce(withdrawn_at, saved_at)
      WHERE passport_id = OLD.id;
    END IF;
    RETURN OLD;
  END IF;
  IF NEW.category::text <> 'car_cleaning' THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND OLD.category::text = 'car_cleaning'
    AND (to_jsonb(NEW) - 'updated_at' - 'display_order') = (to_jsonb(OLD) - 'updated_at' - 'display_order') THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.car_cleaning_passport_archives (passport_id, user_id, public_slug, retained_until)
  VALUES (NEW.id, NEW.user_id, NEW.public_slug, public.car_cleaning_retention_floor(NEW.category_data, saved_at))
  ON CONFLICT (passport_id) DO NOTHING;
  SELECT * INTO archive FROM public.car_cleaning_passport_archives WHERE passport_id = NEW.id FOR UPDATE;
  new_version := archive.latest_version + 1;
  INSERT INTO public.car_cleaning_passport_versions (passport_id, user_id, version, recorded_at, snapshot)
  VALUES (NEW.id, NEW.user_id, new_version, saved_at, to_jsonb(NEW) - 'user_id');
  UPDATE public.car_cleaning_passport_archives
  SET latest_version = new_version,
      retained_until = greatest(retained_until, public.car_cleaning_retention_floor(NEW.category_data, saved_at)),
      guarded_model_definition = CASE
        WHEN guarded_model_definition IS NOT NULL THEN guarded_model_definition || public.car_cleaning_model_definition(NEW.category_data)
        WHEN NEW.category_data ->> 'detergent_scope' = 'yes' AND NEW.category_data ->> 'dpp_profile' = 'annex_vi'
          THEN public.car_cleaning_model_definition(NEW.category_data)
        ELSE NULL END
  WHERE passport_id = NEW.id;
  RETURN NEW;
END;
$$;
CREATE TRIGGER retain_car_cleaning_passport_version
  AFTER INSERT OR UPDATE OR DELETE ON public.passports
  FOR EACH ROW EXECUTE FUNCTION public.capture_car_cleaning_passport_version();

-- Seed only current car records. No original row is changed and earlier versions
-- cannot be reconstructed. The migration transaction prevents partially seeded history.
INSERT INTO public.car_cleaning_passport_archives
  (passport_id, user_id, public_slug, latest_version, retained_until, guarded_model_definition)
SELECT id, user_id, public_slug, 1, public.car_cleaning_retention_floor(category_data, now()),
  CASE WHEN category_data ->> 'detergent_scope' = 'yes' AND category_data ->> 'dpp_profile' = 'annex_vi'
    THEN public.car_cleaning_model_definition(category_data) END
FROM public.passports WHERE category::text = 'car_cleaning';
INSERT INTO public.car_cleaning_passport_versions (passport_id, user_id, version, recorded_at, snapshot)
SELECT id, user_id, 1, now(), to_jsonb(p) - 'user_id'
FROM public.passports p WHERE category::text = 'car_cleaning';

-- Functions are trigger-internal, not callable mutation RPCs.
REVOKE ALL ON FUNCTION public.car_cleaning_history_immutable() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.car_cleaning_retention_floor(jsonb, timestamptz) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.guard_car_cleaning_passport_identity() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.capture_car_cleaning_passport_version() FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.car_cleaning_model_definition(jsonb) FROM PUBLIC, anon, authenticated, service_role;
