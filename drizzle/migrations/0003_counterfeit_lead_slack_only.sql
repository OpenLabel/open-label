CREATE OR REPLACE FUNCTION public.claim_counterfeit_slack_lead(
  p_passport_id uuid, p_user_id uuid, p_stale interval DEFAULT interval '2 minutes')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $$
DECLARE
  r public.counterfeit_lead_deliveries%ROWTYPE;
  tok uuid := gen_random_uuid();
BEGIN
  INSERT INTO public.counterfeit_lead_deliveries (passport_id, user_id)
  VALUES (p_passport_id, p_user_id) ON CONFLICT (passport_id) DO NOTHING;
  SELECT * INTO r FROM public.counterfeit_lead_deliveries WHERE passport_id = p_passport_id FOR UPDATE;
  IF r.user_id <> p_user_id THEN RETURN jsonb_build_object('outcome','forbidden'); END IF;
  IF r.slack_status = 'sent' THEN RETURN jsonb_build_object('outcome','sent'); END IF;
  IF r.slack_status = 'pending' AND r.slack_claimed_at > now() - p_stale THEN
    RETURN jsonb_build_object('outcome','busy');
  END IF;
  UPDATE public.counterfeit_lead_deliveries
    SET slack_status='pending', slack_claim=tok, slack_claimed_at=now(), updated_at=now()
    WHERE passport_id=p_passport_id;
  RETURN jsonb_build_object('outcome','claimed','token',tok);
END; $$;

CREATE OR REPLACE FUNCTION public.finish_counterfeit_slack_lead(p_passport_id uuid, p_token uuid, p_ok boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $$
DECLARE n int;
BEGIN
  UPDATE public.counterfeit_lead_deliveries
    SET slack_status = CASE WHEN p_ok THEN 'sent' ELSE 'failed' END,
        slack_sent_at = CASE WHEN p_ok THEN now() ELSE slack_sent_at END,
        slack_claim = NULL, updated_at = now()
    WHERE passport_id = p_passport_id AND slack_status = 'pending' AND slack_claim = p_token;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n = 1;
END; $$;

REVOKE ALL ON FUNCTION public.claim_counterfeit_slack_lead(uuid, uuid, interval) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.finish_counterfeit_slack_lead(uuid, uuid, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_counterfeit_slack_lead(uuid, uuid, interval) TO service_role;
GRANT EXECUTE ON FUNCTION public.finish_counterfeit_slack_lead(uuid, uuid, boolean) TO service_role;

REVOKE ALL ON FUNCTION public.claim_counterfeit_lead_delivery(uuid, uuid, text, interval) FROM service_role;
REVOKE ALL ON FUNCTION public.finish_counterfeit_lead_delivery(uuid, text, uuid, boolean) FROM service_role;
COMMENT ON FUNCTION public.claim_counterfeit_lead_delivery(uuid, uuid, text, interval) IS 'DEPRECATED: replaced by claim_counterfeit_slack_lead (Slack-only leads)';
COMMENT ON FUNCTION public.finish_counterfeit_lead_delivery(uuid, text, uuid, boolean) IS 'DEPRECATED: replaced by finish_counterfeit_slack_lead (Slack-only leads)';
COMMENT ON COLUMN public.counterfeit_lead_deliveries.email_status IS 'DEPRECATED: counterfeit leads are Slack-only, no email is sent';
COMMENT ON COLUMN public.counterfeit_lead_deliveries.email_claim IS 'DEPRECATED: counterfeit leads are Slack-only';
COMMENT ON COLUMN public.counterfeit_lead_deliveries.email_claimed_at IS 'DEPRECATED: counterfeit leads are Slack-only';
COMMENT ON COLUMN public.counterfeit_lead_deliveries.email_sent_at IS 'DEPRECATED: counterfeit leads are Slack-only';