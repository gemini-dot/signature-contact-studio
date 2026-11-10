CREATE TABLE public.member_profiles (
  user_id uuid PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  full_name text NOT NULL DEFAULT '',
  job_title text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  photo_url text NOT NULL DEFAULT '',
  links jsonb NOT NULL DEFAULT '[]'::jsonb,
  profile_enabled boolean NOT NULL DEFAULT true,
  badge_enabled boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  status text NOT NULL DEFAULT 'disponible',
  status_note text NOT NULL DEFAULT '',
  status_until date,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT mp_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,48}$'),
  CONSTRAINT mp_status CHECK (status IN ('disponible','reunion','deplacement','conges','absent')),
  CONSTRAINT mp_len CHECK (length(bio) <= 600 AND length(status_note) <= 140)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_profiles TO authenticated;
GRANT ALL ON public.member_profiles TO service_role;
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.member_profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own profile insert" ON public.member_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND public.is_booking_eligible(auth.uid()));
CREATE POLICY "own profile update" ON public.member_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.is_booking_eligible(auth.uid()));
CREATE POLICY "own profile delete" ON public.member_profiles FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.member_profile_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE acct_email text;
BEGIN
  SELECT u.email INTO acct_email FROM auth.users u WHERE u.id = NEW.user_id AND u.email_confirmed_at IS NOT NULL;
  IF NEW.badge_enabled AND acct_email IS NOT NULL THEN
    NEW.email := acct_email;
    IF TG_OP = 'INSERT' OR OLD.verified_at IS NULL THEN NEW.verified_at := now(); ELSE NEW.verified_at := OLD.verified_at; END IF;
  ELSE
    NEW.badge_enabled := false;
    NEW.verified_at := NULL;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER member_profile_guard BEFORE INSERT OR UPDATE ON public.member_profiles
FOR EACH ROW EXECUTE FUNCTION public.member_profile_guard();

CREATE OR REPLACE FUNCTION public.get_member_profile(_slug text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
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
    'profile_enabled', p.profile_enabled,
    'verified', p.badge_enabled AND p.verified_at IS NOT NULL, 'verified_at', p.verified_at,
    'status', CASE WHEN expired THEN 'disponible' ELSE p.status END,
    'status_note', CASE WHEN expired THEN '' ELSE p.status_note END,
    'status_until', CASE WHEN expired THEN NULL ELSE p.status_until END,
    'booking_slug', bslug
  );
END $$;
GRANT EXECUTE ON FUNCTION public.get_member_profile(text) TO anon, authenticated;

CREATE TABLE public.team_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  link_url text NOT NULL DEFAULT '',
  starts_on date,
  ends_on date,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tb_url CHECK (image_url ~ '^https://' AND (link_url = '' OR link_url ~ '^https?://')),
  CONSTRAINT tb_dates CHECK (starts_on IS NULL OR ends_on IS NULL OR ends_on >= starts_on)
);
CREATE INDEX team_banners_team_idx ON public.team_banners(team_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_banners TO authenticated;
GRANT ALL ON public.team_banners TO service_role;
ALTER TABLE public.team_banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "banners read" ON public.team_banners FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "banners insert" ON public.team_banners FOR INSERT TO authenticated WITH CHECK (public.is_team_admin(team_id, auth.uid()));
CREATE POLICY "banners update" ON public.team_banners FOR UPDATE TO authenticated USING (public.is_team_admin(team_id, auth.uid())) WITH CHECK (public.is_team_admin(team_id, auth.uid()));
CREATE POLICY "banners delete" ON public.team_banners FOR DELETE TO authenticated USING (public.is_team_admin(team_id, auth.uid()));

CREATE OR REPLACE FUNCTION public.current_team_banner(_team uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object('image_url', b.image_url, 'link_url', b.link_url)
  FROM team_banners b JOIN teams t ON t.id = b.team_id
  WHERE b.team_id = _team
    AND EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = t.owner_id AND s.plan = 'equipe' AND s.status = 'active'
                AND (s.current_period_end IS NULL OR s.current_period_end > now()))
    AND (b.is_default OR ((b.starts_on IS NULL OR b.starts_on <= current_date) AND (b.ends_on IS NULL OR b.ends_on >= current_date)))
  ORDER BY b.is_default ASC, b.starts_on DESC NULLS LAST, b.created_at DESC
  LIMIT 1
$$;
GRANT EXECUTE ON FUNCTION public.current_team_banner(uuid) TO anon, authenticated;