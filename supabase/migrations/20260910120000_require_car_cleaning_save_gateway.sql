-- Deploy the authenticated save-car-cleaning-passport edge and its UI caller first.
-- Restrictive policies compose with existing owner policies, leaving other categories intact.
-- The gateway validates the shared contract, then binds service-role writes to the verified owner.
CREATE POLICY "Car cleaning inserts require the validated save gateway"
  ON public.passports AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (category::text <> 'car_cleaning');
CREATE POLICY "Car cleaning updates require the validated save gateway"
  ON public.passports AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (true) WITH CHECK (category::text <> 'car_cleaning');

-- SELECT and DELETE remain owner-scoped by existing policies. The existing
-- SECURITY DEFINER reorder_passports RPC still permits owner-bound ordering,
-- which only changes display_order and does not create a content version.
