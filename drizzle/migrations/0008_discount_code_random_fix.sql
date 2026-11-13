CREATE OR REPLACE FUNCTION public.admin_create_discount(_kind text, _value numeric, _months int, _valid_until timestamptz, _max_uses int, _plans text[], _reason text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; c text; i int; b bytea;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Accès refusé'; END IF;
  IF _kind NOT IN ('percent','amount') THEN RAISE EXCEPTION 'Type invalide'; END IF;
  IF _kind = 'percent' AND _value > 100 THEN RAISE EXCEPTION 'Un pourcentage ne peut dépasser 100'; END IF;
  IF _valid_until <= now() THEN RAISE EXCEPTION 'La date de validité doit être dans le futur'; END IF;
  IF NOT (coalesce(_plans,'{}') <@ ARRAY['solo','equipe']) THEN RAISE EXCEPTION 'Formule invalide'; END IF;
  FOR attempt IN 1..5 LOOP
    b := decode(replace(gen_random_uuid()::text,'-',''),'hex'); c := '';
    FOR i IN 0..9 LOOP c := c || substr(alphabet, (get_byte(b,i) % 32) + 1, 1); END LOOP;
    BEGIN
      INSERT INTO discount_codes(code, kind, value, months, valid_until, max_uses, plans, reason, created_by)
      VALUES (c, _kind, _value, _months, _valid_until, _max_uses, coalesce(_plans,'{}'), left(coalesce(_reason,''),200), auth.uid());
      RETURN c;
    EXCEPTION WHEN unique_violation THEN NULL; END;
  END LOOP;
  RAISE EXCEPTION 'Création impossible, réessayez';
END $$;