CREATE TABLE IF NOT EXISTS public.counterfeit_lead_deliveries (
  passport_id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  email_status text NOT NULL DEFAULT 'none' CHECK (email_status IN ('none','pending','sent','failed')),
  email_claim uuid,
  email_claimed_at timestamptz,
  email_sent_at timestamptz,
  slack_status text NOT NULL DEFAULT 'none' CHECK (slack_status IN ('none','pending','sent','failed')),
  slack_claim uuid,
  slack_claimed_at timestamptz,
  slack_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.counterfeit_lead_deliveries FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.counterfeit_lead_deliveries TO service_role;
ALTER TABLE public.counterfeit_lead_deliveries ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.claim_counterfeit_lead_delivery(
  p_passport_id uuid, p_user_id uuid, p_channel text, p_stale interval DEFAULT interval '2 minutes')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $$
DECLARE
  r public.counterfeit_lead_deliveries%ROWTYPE;
  st text; claimed timestamptz; tok uuid := gen_random_uuid();
BEGIN
  IF p_channel NOT IN ('email','slack') THEN RAISE EXCEPTION 'invalid channel'; END IF;
  INSERT INTO public.counterfeit_lead_deliveries (passport_id, user_id)
  VALUES (p_passport_id, p_user_id) ON CONFLICT (passport_id) DO NOTHING;
  SELECT * INTO r FROM public.counterfeit_lead_deliveries WHERE passport_id = p_passport_id FOR UPDATE;
  IF r.user_id <> p_user_id THEN RETURN jsonb_build_object('outcome','forbidden'); END IF;
  IF p_channel = 'email' THEN st := r.email_status; claimed := r.email_claimed_at;
  ELSE st := r.slack_status; claimed := r.slack_claimed_at; END IF;
  IF st = 'sent' THEN RETURN jsonb_build_object('outcome','sent','requested_at',r.requested_at); END IF;
  IF st = 'pending' AND claimed > now() - p_stale THEN RETURN jsonb_build_object('outcome','busy'); END IF;
  IF p_channel = 'email' THEN
    UPDATE public.counterfeit_lead_deliveries SET email_status='pending', email_claim=tok, email_claimed_at=now(), updated_at=now() WHERE passport_id=p_passport_id;
  ELSE
    UPDATE public.counterfeit_lead_deliveries SET slack_status='pending', slack_claim=tok, slack_claimed_at=now(), updated_at=now() WHERE passport_id=p_passport_id;
  END IF;
  RETURN jsonb_build_object('outcome','claimed','token',tok,'requested_at',r.requested_at);
END; $$;

CREATE OR REPLACE FUNCTION public.finish_counterfeit_lead_delivery(
  p_passport_id uuid, p_channel text, p_token uuid, p_ok boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $$
BEGIN
  IF p_channel = 'email' THEN
    UPDATE public.counterfeit_lead_deliveries
    SET email_status = CASE WHEN p_ok THEN 'sent' ELSE 'failed' END,
        email_sent_at = CASE WHEN p_ok THEN now() ELSE NULL END, updated_at = now()
    WHERE passport_id = p_passport_id AND email_claim = p_token AND email_status = 'pending';
  ELSIF p_channel = 'slack' THEN
    UPDATE public.counterfeit_lead_deliveries
    SET slack_status = CASE WHEN p_ok THEN 'sent' ELSE 'failed' END,
        slack_sent_at = CASE WHEN p_ok THEN now() ELSE NULL END, updated_at = now()
    WHERE passport_id = p_passport_id AND slack_claim = p_token AND slack_status = 'pending';
  ELSE RETURN false; END IF;
  RETURN FOUND;
END; $$;

REVOKE ALL ON FUNCTION public.claim_counterfeit_lead_delivery(uuid, uuid, text, interval) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.finish_counterfeit_lead_delivery(uuid, text, uuid, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_counterfeit_lead_delivery(uuid, uuid, text, interval) TO service_role;
GRANT EXECUTE ON FUNCTION public.finish_counterfeit_lead_delivery(uuid, text, uuid, boolean) TO service_role;