ALTER TABLE public.member_profiles ADD COLUMN IF NOT EXISTS services jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.member_profiles ADD COLUMN IF NOT EXISTS activity text NOT NULL DEFAULT '';

CREATE OR REPLACE FUNCTION public.team_has_plan(_team uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM teams t JOIN subscriptions s ON s.user_id = t.owner_id
    WHERE t.id = _team AND s.plan = 'equipe' AND s.status = 'active'
      AND (s.current_period_end IS NULL OR s.current_period_end > now()))
$$;

DROP POLICY IF EXISTS "banners insert" ON public.team_banners;
DROP POLICY IF EXISTS "banners update" ON public.team_banners;
CREATE POLICY "banners insert" ON public.team_banners FOR INSERT TO authenticated
  WITH CHECK (is_team_admin(team_id, auth.uid()) AND team_has_plan(team_id));
CREATE POLICY "banners update" ON public.team_banners FOR UPDATE TO authenticated
  USING (is_team_admin(team_id, auth.uid()))
  WITH CHECK (is_team_admin(team_id, auth.uid()) AND team_has_plan(team_id));

CREATE OR REPLACE FUNCTION public.member_profile_limits()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF jsonb_typeof(NEW.services) <> 'array' OR jsonb_array_length(NEW.services) > 12 THEN RAISE EXCEPTION '12 services maximum'; END IF;
  IF length(NEW.activity) > 1500 THEN RAISE EXCEPTION 'Description trop longue'; END IF;
  IF NEW.status NOT IN ('disponible','reunion','deplacement','conges','absent','occupe') THEN NEW.status := 'disponible'; END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS member_profile_limits ON public.member_profiles;
CREATE TRIGGER member_profile_limits BEFORE INSERT OR UPDATE ON public.member_profiles FOR EACH ROW EXECUTE FUNCTION public.member_profile_limits();

CREATE OR REPLACE FUNCTION public.get_member_profile(_slug text)
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE p member_profiles; bslug text; expired boolean;
BEGIN
  SELECT * INTO p FROM member_profiles WHERE slug = lower(_slug);
  IF p IS NULL OR NOT is_booking_eligible(p.user_id) THEN RETURN NULL; END IF;
  SELECT b.slug INTO bslug FROM booking_pages b WHERE b.user_id = p.user_id AND b.enabled;
  expired := p.status_until IS NOT NULL AND p.status_until < current_date;
  RETURN jsonb_build_object(
    'full_name', p.full_name, 'job_title', p.job_title, 'company', p.company,
    'email', p.email, 'phone', p.phone, 'website', p.website, 'address', p.address,
    'bio', p.bio, 'photo_url', p.photo_url, 'links', p.links,
    'activity', p.activity, 'services', p.services,
    'profile_enabled', p.profile_enabled,
    'verified', p.badge_enabled AND p.verified_at IS NOT NULL, 'verified_at', p.verified_at,
    'status', CASE WHEN expired THEN 'disponible' ELSE p.status END,
    'status_note', CASE WHEN expired THEN '' ELSE p.status_note END,
    'status_until', CASE WHEN expired THEN NULL ELSE p.status_until END,
    'booking_slug', bslug
  );
END $function$;

CREATE POLICY "member media read own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'member-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "member media insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'member-media' AND (storage.foldername(name))[1] = auth.uid()::text AND public.is_booking_eligible(auth.uid()));
CREATE POLICY "member media delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'member-media' AND (storage.foldername(name))[1] = auth.uid()::text);