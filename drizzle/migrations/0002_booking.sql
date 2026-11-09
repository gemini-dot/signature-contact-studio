CREATE TABLE public.booking_pages (
  user_id uuid PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT 'Prendre rendez-vous',
  host_name text NOT NULL DEFAULT '',
  intro text NOT NULL DEFAULT '',
  duration_min integer NOT NULL DEFAULT 30,
  buffer_min integer NOT NULL DEFAULT 0,
  min_notice_hours integer NOT NULL DEFAULT 2,
  horizon_days integer NOT NULL DEFAULT 30,
  weekly jsonb NOT NULL DEFAULT '{}'::jsonb,
  blocked jsonb NOT NULL DEFAULT '[]'::jsonb,
  timezone text NOT NULL DEFAULT 'Europe/Paris',
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,48}$'),
  CONSTRAINT dur CHECK (duration_min BETWEEN 5 AND 480 AND buffer_min BETWEEN 0 AND 240 AND min_notice_hours BETWEEN 0 AND 720 AND horizon_days BETWEEN 1 AND 365)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_pages TO authenticated;
GRANT ALL ON public.booking_pages TO service_role;
ALTER TABLE public.booking_pages ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  reason text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX appointments_owner_idx ON public.appointments(owner_id, starts_at);
GRANT SELECT, UPDATE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_booking_eligible(_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.status = 'active' AND s.plan IN ('solo','equipe')
      AND (s.current_period_end IS NULL OR s.current_period_end > now())
      AND (s.user_id = _user OR (s.plan = 'equipe' AND s.user_id IN (
        SELECT t.owner_id FROM teams t JOIN team_members m ON m.team_id = t.id
        WHERE m.user_id = _user)))
  )
$$;

CREATE POLICY "own booking page read" ON public.booking_pages FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own booking page insert" ON public.booking_pages FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND public.is_booking_eligible(auth.uid()));
CREATE POLICY "own booking page update" ON public.booking_pages FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.is_booking_eligible(auth.uid()));
CREATE POLICY "own booking page delete" ON public.booking_pages FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own appointments read" ON public.appointments FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "own appointments update" ON public.appointments FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- Page publique : réglages + créneaux occupés (sans données personnelles)
CREATE OR REPLACE FUNCTION public.get_booking_page(_slug text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE p booking_pages;
BEGIN
  SELECT * INTO p FROM booking_pages WHERE slug = lower(_slug);
  IF p IS NULL OR NOT p.enabled OR NOT is_booking_eligible(p.user_id) THEN RETURN NULL; END IF;
  RETURN jsonb_build_object(
    'title', p.title, 'host_name', p.host_name, 'intro', p.intro,
    'duration_min', p.duration_min, 'buffer_min', p.buffer_min,
    'min_notice_hours', p.min_notice_hours, 'horizon_days', p.horizon_days,
    'weekly', p.weekly, 'blocked', p.blocked, 'timezone', p.timezone,
    'busy', COALESCE((SELECT jsonb_agg(jsonb_build_object('s', a.starts_at, 'e', a.ends_at))
      FROM appointments a WHERE a.owner_id = p.user_id AND a.status = 'confirmed' AND a.ends_at > now()), '[]'::jsonb)
  );
END $$;

CREATE OR REPLACE FUNCTION public.book_appointment(_slug text, _starts_at timestamptz, _name text, _email text, _phone text, _reason text)
RETURNS uuid LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public AS $$
DECLARE p booking_pages; e timestamptz; loc timestamp; loc_end timestamp; d text; ok boolean := false; r jsonb; b jsonb; new_id uuid;
BEGIN
  SELECT * INTO p FROM booking_pages WHERE slug = lower(_slug) FOR UPDATE;
  IF p IS NULL OR NOT p.enabled OR NOT is_booking_eligible(p.user_id) THEN RAISE EXCEPTION 'Page indisponible'; END IF;
  IF length(trim(coalesce(_name,''))) < 2 OR _email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN RAISE EXCEPTION 'Coordonnées invalides'; END IF;
  IF length(_name) > 120 OR length(_email) > 200 OR length(coalesce(_phone,'')) > 40 OR length(coalesce(_reason,'')) > 1000 THEN RAISE EXCEPTION 'Texte trop long'; END IF;
  e := _starts_at + make_interval(mins => p.duration_min);
  IF _starts_at < now() + make_interval(hours => p.min_notice_hours) OR _starts_at > now() + make_interval(days => p.horizon_days) THEN
    RAISE EXCEPTION 'Créneau hors période de réservation'; END IF;
  loc := _starts_at AT TIME ZONE p.timezone; loc_end := e AT TIME ZONE p.timezone;
  IF loc::date <> loc_end::date AND loc_end::time <> '00:00' THEN RAISE EXCEPTION 'Créneau invalide'; END IF;
  d := extract(isodow FROM loc)::text;
  FOR r IN SELECT * FROM jsonb_array_elements(coalesce(p.weekly->d, '[]'::jsonb)) LOOP
    IF loc::time >= (r->>'start')::time AND loc_end::time <= (r->>'end')::time AND loc_end::time > loc::time THEN ok := true; END IF;
  END LOOP;
  IF NOT ok THEN RAISE EXCEPTION 'Créneau non disponible'; END IF;
  FOR b IN SELECT * FROM jsonb_array_elements(p.blocked) LOOP
    IF loc::date BETWEEN (b->>'from')::date AND (b->>'to')::date THEN RAISE EXCEPTION 'Date indisponible'; END IF;
  END LOOP;
  IF EXISTS (SELECT 1 FROM appointments a WHERE a.owner_id = p.user_id AND a.status = 'confirmed'
    AND a.starts_at < e + make_interval(mins => p.buffer_min) AND a.ends_at + make_interval(mins => p.buffer_min) > _starts_at) THEN
    RAISE EXCEPTION 'Ce créneau vient d''être réservé'; END IF;
  INSERT INTO appointments(owner_id, starts_at, ends_at, name, email, phone, reason)
  VALUES (p.user_id, _starts_at, e, trim(_name), lower(trim(_email)), coalesce(_phone,''), coalesce(_reason,''))
  RETURNING id INTO new_id;
  RETURN new_id;
END $$;

GRANT EXECUTE ON FUNCTION public.get_booking_page(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.book_appointment(text, timestamptz, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_booking_eligible(uuid) TO authenticated;