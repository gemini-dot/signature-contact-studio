ALTER TABLE public.member_profiles
  ADD COLUMN IF NOT EXISTS document_label text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS document_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS rating numeric(2,1),
  ADD COLUMN IF NOT EXISTS rating_count integer,
  ADD COLUMN IF NOT EXISTS rating_source text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS reviews_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS testimonial text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS testimonial_author text NOT NULL DEFAULT '';

CREATE OR REPLACE FUNCTION public.member_profile_limits()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
BEGIN
  IF jsonb_typeof(NEW.services) <> 'array' OR jsonb_array_length(NEW.services) > 12 THEN RAISE EXCEPTION '12 services maximum'; END IF;
  IF length(NEW.activity) > 1500 THEN RAISE EXCEPTION 'Description trop longue'; END IF;
  IF NEW.status NOT IN ('disponible','reunion','deplacement','conges','absent','occupe') THEN NEW.status := 'disponible'; END IF;
  IF NEW.rating IS NOT NULL AND (NEW.rating < 0 OR NEW.rating > 5) THEN RAISE EXCEPTION 'Note entre 0 et 5'; END IF;
  IF NEW.rating_count IS NOT NULL AND (NEW.rating_count < 0 OR NEW.rating_count > 1000000) THEN RAISE EXCEPTION 'Nombre d''avis invalide'; END IF;
  IF length(NEW.document_label) > 60 OR length(NEW.rating_source) > 40 OR length(NEW.testimonial) > 280 OR length(NEW.testimonial_author) > 80 THEN RAISE EXCEPTION 'Texte trop long'; END IF;
  IF length(NEW.document_url) > 2000 OR length(NEW.reviews_url) > 500 THEN RAISE EXCEPTION 'Lien trop long'; END IF;
  IF NEW.document_url <> '' AND NEW.document_url !~ '^https://' THEN RAISE EXCEPTION 'Lien de document invalide'; END IF;
  IF NEW.reviews_url <> '' AND NEW.reviews_url !~ '^https://' THEN RAISE EXCEPTION 'Lien d''avis invalide (https:// requis)'; END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.get_member_profile(_slug text)
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
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
    'booking_slug', bslug,
    'has_document', p.document_url <> '', 'document_label', p.document_label,
    'rating', p.rating, 'rating_count', p.rating_count, 'rating_source', p.rating_source,
    'reviews_url', p.reviews_url, 'testimonial', p.testimonial, 'testimonial_author', p.testimonial_author
  );
END $$;

CREATE OR REPLACE FUNCTION public.get_member_document(_slug text)
 RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT NULLIF(p.document_url, '') FROM member_profiles p
  WHERE p.slug = lower(_slug) AND p.profile_enabled AND is_booking_eligible(p.user_id)
$$;
GRANT EXECUTE ON FUNCTION public.get_member_document(text) TO anon, authenticated;

-- Gratuit : 1 signature ; Solo/Équipe : jusqu'à 20 variantes
CREATE OR REPLACE FUNCTION public.signature_quota()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM signatures WHERE user_id = NEW.user_id;
  IF NOT is_booking_eligible(NEW.user_id) AND n >= 1 THEN
    RAISE EXCEPTION 'La formule Gratuite inclut 1 signature. Passez à Solo pour créer plusieurs variantes.';
  END IF;
  IF n >= 20 THEN RAISE EXCEPTION '20 signatures maximum'; END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS signature_quota ON public.signatures;
CREATE TRIGGER signature_quota BEFORE INSERT ON public.signatures FOR EACH ROW EXECUTE FUNCTION public.signature_quota();

-- Lien magique d'onboarding Équipe
CREATE TABLE public.team_join_links (
  team_id uuid PRIMARY KEY REFERENCES public.teams(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.team_join_links TO authenticated;
GRANT ALL ON public.team_join_links TO service_role;
ALTER TABLE public.team_join_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "join link admin read" ON public.team_join_links FOR SELECT TO authenticated USING (is_team_admin(team_id, auth.uid()));

CREATE OR REPLACE FUNCTION public.manage_join_link(_team uuid, _action text)
 RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE t text;
BEGIN
  IF auth.uid() IS NULL OR NOT is_team_admin(_team, auth.uid()) THEN RAISE EXCEPTION 'Réservé aux administrateurs'; END IF;
  IF NOT team_has_plan(_team) THEN RAISE EXCEPTION 'Fonction réservée à la formule Équipe'; END IF;
  IF _action = 'regenerate' THEN
    INSERT INTO team_join_links(team_id) VALUES (_team)
    ON CONFLICT (team_id) DO UPDATE SET token = replace(gen_random_uuid()::text, '-', ''), enabled = true, created_at = now();
  ELSIF _action = 'disable' THEN
    UPDATE team_join_links SET enabled = false WHERE team_id = _team; RETURN NULL;
  ELSE
    INSERT INTO team_join_links(team_id) VALUES (_team) ON CONFLICT (team_id) DO UPDATE SET enabled = true;
  END IF;
  SELECT token INTO t FROM team_join_links WHERE team_id = _team;
  RETURN t;
END $$;
GRANT EXECUTE ON FUNCTION public.manage_join_link(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_join_info(_token text)
 RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT jsonb_build_object('team_name', t.name, 'template', t.template,
    'company', coalesce(t.base_data->>'company',''), 'logoUrl', coalesce(t.base_data->>'logoUrl',''),
    'accent', coalesce(t.base_data->>'accent',''))
  FROM team_join_links l JOIN teams t ON t.id = l.team_id
  WHERE l.token = _token AND l.enabled AND team_has_plan(t.id)
$$;
GRANT EXECUTE ON FUNCTION public.get_join_info(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.join_team(_token text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE l team_join_links; t teams; uemail text; seats int; used int;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Connexion requise'; END IF;
  SELECT * INTO l FROM team_join_links WHERE token = _token AND enabled;
  IF l IS NULL THEN RAISE EXCEPTION 'Lien d''invitation invalide ou désactivé'; END IF;
  SELECT * INTO t FROM teams WHERE id = l.team_id;
  IF NOT team_has_plan(t.id) THEN RAISE EXCEPTION 'L''abonnement Équipe de cette entreprise n''est plus actif'; END IF;
  SELECT email INTO uemail FROM auth.users WHERE id = auth.uid() AND email_confirmed_at IS NOT NULL;
  IF uemail IS NULL THEN RAISE EXCEPTION 'Confirmez d''abord votre adresse e-mail'; END IF;
  IF t.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM team_members WHERE team_id = t.id AND (user_id = auth.uid() OR lower(email) = lower(uemail))) THEN
    UPDATE team_members SET user_id = auth.uid(), status = 'active' WHERE team_id = t.id AND lower(email) = lower(uemail) AND user_id IS NULL;
    RETURN jsonb_build_object('team_id', t.id, 'base', t.base_data, 'template', t.template, 'already', true);
  END IF;
  SELECT s.seats INTO seats FROM subscriptions s WHERE s.user_id = t.owner_id;
  SELECT count(*) INTO used FROM team_members WHERE team_id = t.id;
  IF coalesce(seats,0) > 0 AND used >= seats THEN RAISE EXCEPTION 'Toutes les places de l''équipe sont occupées : demandez à votre administrateur d''en ajouter.'; END IF;
  INSERT INTO team_members(team_id, email, user_id, status, role) VALUES (t.id, lower(uemail), auth.uid(), 'active', 'member');
  RETURN jsonb_build_object('team_id', t.id, 'base', t.base_data, 'template', t.template, 'already', false);
END $$;
GRANT EXECUTE ON FUNCTION public.join_team(text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.join_team(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.manage_join_link(uuid, text) FROM anon;