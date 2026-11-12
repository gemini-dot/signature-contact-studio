CREATE OR REPLACE FUNCTION public.import_team_members(_team uuid, _emails text[])
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE t teams; seats int; used int; e text; added int := 0; skipped int := 0; clean text[];
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Connexion requise'; END IF;
  SELECT * INTO t FROM teams WHERE id = _team;
  IF t IS NULL THEN RAISE EXCEPTION 'Équipe introuvable'; END IF;
  IF NOT (t.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM team_members WHERE team_id = _team AND user_id = auth.uid() AND role = 'admin')) THEN
    RAISE EXCEPTION 'Réservé aux administrateurs de l''équipe'; END IF;
  IF NOT team_has_plan(_team) THEN RAISE EXCEPTION 'L''import groupé est inclus dans la formule Équipe'; END IF;
  IF coalesce(array_length(_emails,1),0) > 500 THEN RAISE EXCEPTION '500 lignes maximum par import'; END IF;
  SELECT array_agg(DISTINCT lower(trim(x))) INTO clean FROM unnest(_emails) x
    WHERE lower(trim(x)) ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(x) <= 254;
  SELECT s.seats INTO seats FROM subscriptions s WHERE s.user_id = t.owner_id;
  SELECT count(*) INTO used FROM team_members WHERE team_id = _team;
  FOREACH e IN ARRAY coalesce(clean, '{}') LOOP
    IF EXISTS (SELECT 1 FROM team_members WHERE team_id = _team AND lower(email) = e) THEN skipped := skipped + 1; CONTINUE; END IF;
    IF coalesce(seats,0) > 0 AND used >= seats THEN skipped := skipped + 1; CONTINUE; END IF;
    INSERT INTO team_members(team_id, email, role, status) VALUES (_team, e, 'member', 'invited');
    used := used + 1; added := added + 1;
  END LOOP;
  RETURN jsonb_build_object('added', added, 'skipped', skipped, 'invalid', coalesce(array_length(_emails,1),0) - coalesce(array_length(clean,1),0));
END $$;
REVOKE EXECUTE ON FUNCTION public.import_team_members(uuid, text[]) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.import_team_members(uuid, text[]) TO authenticated;