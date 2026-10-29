create type public.app_role as enum ('admin', 'user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Signatures personnelles
create table public.signatures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null default 'Ma signature',
  template text not null default 'moderne',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.signatures to authenticated;
grant all on public.signatures to service_role;
alter table public.signatures enable row level security;
create policy "own signatures" on public.signatures for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admin reads signatures" on public.signatures for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Équipes
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  name text not null,
  template text not null default 'moderne',
  base_data jsonb not null default '{}'::jsonb,
  lock_logo boolean not null default true,
  lock_colors boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  email text not null,
  user_id uuid,
  role text not null default 'member' check (role in ('admin','member')),
  status text not null default 'invited' check (status in ('invited','active')),
  created_at timestamptz not null default now(),
  unique (team_id, email)
);
grant select, insert, update, delete on public.teams to authenticated;
grant all on public.teams to service_role;
grant select, insert, update, delete on public.team_members to authenticated;
grant all on public.team_members to service_role;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;

create or replace function public.is_team_admin(_team uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.teams where id = _team and owner_id = _user)
      or exists (select 1 from public.team_members where team_id = _team and user_id = _user and role = 'admin' and status = 'active')
$$;
create or replace function public.is_team_member(_team uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_team_admin(_team, _user)
      or exists (select 1 from public.team_members m join auth.users u on u.id = _user
                 where m.team_id = _team and (m.user_id = _user or lower(m.email) = lower(u.email)))
$$;

create policy "team read" on public.teams for select to authenticated using (public.is_team_member(id, auth.uid()) or public.has_role(auth.uid(), 'admin'));
create policy "team create" on public.teams for insert to authenticated with check (owner_id = auth.uid());
create policy "team update" on public.teams for update to authenticated using (public.is_team_admin(id, auth.uid())) with check (public.is_team_admin(id, auth.uid()));
create policy "team delete" on public.teams for delete to authenticated using (owner_id = auth.uid());

create policy "members read" on public.team_members for select to authenticated using (public.is_team_member(team_id, auth.uid()) or public.has_role(auth.uid(), 'admin'));
create policy "members manage" on public.team_members for insert to authenticated with check (public.is_team_admin(team_id, auth.uid()));
create policy "members update" on public.team_members for update to authenticated using (public.is_team_admin(team_id, auth.uid()));
create policy "members delete" on public.team_members for delete to authenticated using (public.is_team_admin(team_id, auth.uid()));

-- Création du profil + rôle à l'inscription ; l'admin du site est déterminé par son e-mail.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;
  if lower(new.email) = 'gemini@chinasamy.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  update public.team_members set user_id = new.id, status = 'active'
    where lower(email) = lower(new.email) and user_id is null;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();