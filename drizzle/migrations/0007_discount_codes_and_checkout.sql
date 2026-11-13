CREATE TABLE public.discount_codes (
  code text PRIMARY KEY CHECK (code ~ '^[A-Z0-9]{10}$'),
  kind text NOT NULL CHECK (kind IN ('percent','amount')),
  value numeric(10,2) NOT NULL CHECK (value > 0 AND value <= 1000),
  months int CHECK (months IS NULL OR months BETWEEN 1 AND 36),
  valid_until timestamptz NOT NULL,
  max_uses int CHECK (max_uses IS NULL OR max_uses >= 1),
  uses int NOT NULL DEFAULT 0,
  plans text[] NOT NULL DEFAULT '{}',
  reason text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.discount_codes TO authenticated;
GRANT ALL ON public.discount_codes TO service_role;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read codes" ON public.discount_codes FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update codes" ON public.discount_codes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

ALTER TABLE public.invoices ADD COLUMN discount_code text, ADD COLUMN discount_cents int NOT NULL DEFAULT 0;

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
    b := gen_random_bytes(10); c := '';
    FOR i IN 0..9 LOOP c := c || substr(alphabet, (get_byte(b,i) % 32) + 1, 1); END LOOP;
    BEGIN
      INSERT INTO discount_codes(code, kind, value, months, valid_until, max_uses, plans, reason, created_by)
      VALUES (c, _kind, _value, _months, _valid_until, _max_uses, coalesce(_plans,'{}'), left(coalesce(_reason,''),200), auth.uid());
      RETURN c;
    EXCEPTION WHEN unique_violation THEN NULL; END;
  END LOOP;
  RAISE EXCEPTION 'Création impossible, réessayez';
END $$;
REVOKE EXECUTE ON FUNCTION public.admin_create_discount(text,numeric,int,timestamptz,int,text[],text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.admin_create_discount(text,numeric,int,timestamptz,int,text[],text) TO authenticated;

CREATE OR REPLACE FUNCTION public.check_discount_code(_code text, _plan text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r discount_codes; c text := upper(regexp_replace(coalesce(_code,''), '[^A-Za-z0-9]', '', 'g'));
BEGIN
  SELECT * INTO r FROM discount_codes WHERE code = c;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Code de réduction inconnu.'); END IF;
  IF NOT r.active THEN RETURN jsonb_build_object('ok',false,'error','Ce code n''est plus actif.'); END IF;
  IF r.valid_until < now() THEN RETURN jsonb_build_object('ok',false,'error','Ce code a expiré.'); END IF;
  IF r.max_uses IS NOT NULL AND r.uses >= r.max_uses THEN RETURN jsonb_build_object('ok',false,'error','Ce code a atteint son nombre maximal d''utilisations.'); END IF;
  IF cardinality(r.plans) > 0 AND NOT (_plan = ANY(r.plans)) THEN RETURN jsonb_build_object('ok',false,'error','Ce code ne s''applique pas à cette formule.'); END IF;
  RETURN jsonb_build_object('ok',true,'code',r.code,'kind',r.kind,'value',r.value,'months',r.months);
END $$;
GRANT EXECUTE ON FUNCTION public.check_discount_code(text,text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.subscribe_with_code(_plan text, _cycle text, _seats int, _code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); chk jsonb; base int; off int := 0; s subscriptions; inv_id uuid; r discount_codes;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _plan NOT IN ('solo','equipe') THEN RAISE EXCEPTION 'plan invalide'; END IF;
  IF _plan = 'equipe' THEN _cycle := 'mensuel'; END IF;
  IF _cycle NOT IN ('mensuel','annuel') THEN RAISE EXCEPTION 'cycle invalide'; END IF;
  IF _plan = 'equipe' AND (coalesce(_seats,0) < 1 OR _seats > 500) THEN RAISE EXCEPTION 'nombre de collaborateurs invalide'; END IF;
  IF _plan = 'equipe' AND _seats < (SELECT count(*) FROM team_members m JOIN teams t ON t.id = m.team_id WHERE t.owner_id = uid) THEN
    RAISE EXCEPTION 'Votre équipe compte déjà plus de collaborateurs que ce nombre de places';
  END IF;
  base := CASE WHEN _plan='solo' AND _cycle='annuel' THEN 5900 WHEN _plan='solo' THEN 600 ELSE 1900 + 100*_seats END;
  IF coalesce(_code,'') <> '' THEN
    chk := public.check_discount_code(_code, _plan);
    IF NOT (chk->>'ok')::boolean THEN RAISE EXCEPTION '%', chk->>'error'; END IF;
    SELECT * INTO r FROM discount_codes WHERE code = chk->>'code' FOR UPDATE;
    off := CASE WHEN r.kind='percent' THEN round(base * least(r.value,100) / 100) ELSE round(r.value*100) END;
    off := least(off, base);
    UPDATE discount_codes SET uses = uses + 1 WHERE code = r.code;
  END IF;
  s := public.subscribe_test(_plan, _cycle, coalesce(_seats,0));
  SELECT id INTO inv_id FROM invoices WHERE user_id = uid ORDER BY issued_at DESC LIMIT 1;
  IF off > 0 AND inv_id IS NOT NULL THEN
    UPDATE invoices SET amount_cents = base - off, discount_cents = off, discount_code = r.code WHERE id = inv_id;
  END IF;
  RETURN jsonb_build_object('plan', s.plan, 'amount_cents', base - off, 'discount_cents', off);
END $$;
REVOKE EXECUTE ON FUNCTION public.subscribe_with_code(text,text,int,text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.subscribe_with_code(text,text,int,text) TO authenticated;