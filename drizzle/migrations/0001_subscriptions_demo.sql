create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  plan text not null default 'gratuit' check (plan in ('gratuit','solo','equipe')),
  cycle text not null default 'mensuel' check (cycle in ('mensuel','annuel')),
  seats int not null default 0,
  status text not null default 'active' check (status in ('active','canceled','past_due')),
  auto_renew boolean not null default true,
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz,
  test_mode boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  number text not null unique,
  plan text not null,
  cycle text not null,
  amount_cents int not null,
  issued_at timestamptz not null default now(),
  period_end timestamptz not null,
  test_mode boolean not null default true
);
grant select on public.subscriptions to authenticated;
grant select on public.invoices to authenticated;
grant all on public.subscriptions to service_role;
grant all on public.invoices to service_role;
alter table public.subscriptions enable row level security;
alter table public.invoices enable row level security;
create policy "own sub" on public.subscriptions for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own invoices" on public.invoices for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- Souscription en mode test (aucun paiement réel). Prix : Solo 6 €/mois ou 59 €/an ; Équipe 19 € + 1 €/collaborateur/mois.
create or replace function public.subscribe_test(_plan text, _cycle text, _seats int)
returns public.subscriptions language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  amount int;
  period interval;
  s public.subscriptions;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if _plan not in ('gratuit','solo','equipe') then raise exception 'plan invalide'; end if;
  if _cycle not in ('mensuel','annuel') then raise exception 'cycle invalide'; end if;
  if _plan = 'equipe' then _cycle := 'mensuel'; end if;
  period := case when _cycle = 'annuel' then interval '1 year' else interval '1 month' end;
  amount := case
    when _plan = 'solo' and _cycle = 'annuel' then 5900
    when _plan = 'solo' then 600
    when _plan = 'equipe' then 1900 + 100 * greatest(0, coalesce(_seats,0))
    else 0 end;
  insert into public.subscriptions (user_id, plan, cycle, seats, status, auto_renew, current_period_start, current_period_end, updated_at)
  values (uid, _plan, _cycle, case when _plan='equipe' then greatest(0,coalesce(_seats,0)) else 0 end, 'active', true, now(),
          case when _plan = 'gratuit' then null else now() + period end, now())
  on conflict (user_id) do update set plan = excluded.plan, cycle = excluded.cycle, seats = excluded.seats,
    status = 'active', auto_renew = true, current_period_start = excluded.current_period_start,
    current_period_end = excluded.current_period_end, updated_at = now()
  returning * into s;
  if amount > 0 then
    insert into public.invoices (user_id, number, plan, cycle, amount_cents, period_end)
    values (uid, 'TEST-' || to_char(now(),'YYYYMMDD') || '-' || substr(replace(gen_random_uuid()::text,'-',''),1,6), _plan, _cycle, amount, s.current_period_end);
  end if;
  return s;
end $$;

create or replace function public.set_auto_renew(_on boolean)
returns void language sql security definer set search_path = public as $$
  update public.subscriptions set auto_renew = _on, updated_at = now() where user_id = auth.uid();
$$;
grant execute on function public.subscribe_test(text,text,int) to authenticated;
grant execute on function public.set_auto_renew(boolean) to authenticated;