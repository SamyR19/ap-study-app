-- =====================================================
-- STUDY GROUPS SCHEMA
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: CREATE ALL TABLES FIRST
-- =====================================================

-- Study Groups Table
create table if not exists public.study_groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  invite_code text unique not null,
  max_members integer default 8,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Study Group Members Table
create table if not exists public.study_group_members (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.study_groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member' not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(group_id, user_id)
);

-- Study Group Sets Table
create table if not exists public.study_group_sets (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.study_groups(id) on delete cascade not null,
  set_id uuid references public.flashcard_sets(id) on delete cascade not null,
  added_by uuid references public.profiles(id) on delete cascade not null,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(group_id, set_id)
);

-- Pending Invites Table
create table if not exists public.pending_invites (
  id uuid default uuid_generate_v4() primary key,
  invite_code text not null,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone default (timezone('utc'::text, now()) + interval '7 days') not null
);

-- =====================================================
-- STEP 2: CREATE INDEXES
-- =====================================================

create index if not exists study_groups_invite_code_idx on public.study_groups (invite_code);
create index if not exists study_groups_creator_idx on public.study_groups (creator_id);
create index if not exists study_group_members_group_idx on public.study_group_members (group_id);
create index if not exists study_group_members_user_idx on public.study_group_members (user_id);
create index if not exists study_group_sets_group_idx on public.study_group_sets (group_id);
create index if not exists pending_invites_code_idx on public.pending_invites (invite_code);

-- =====================================================
-- STEP 3: ENABLE RLS ON ALL TABLES
-- =====================================================

alter table public.study_groups enable row level security;
alter table public.study_group_members enable row level security;
alter table public.study_group_sets enable row level security;
alter table public.pending_invites enable row level security;

-- =====================================================
-- STEP 4: CREATE POLICIES FOR STUDY_GROUPS
-- =====================================================

drop policy if exists "Users can view groups they are members of" on public.study_groups;
drop policy if exists "Anyone can view groups by invite code" on public.study_groups;
drop policy if exists "Users can create groups" on public.study_groups;
drop policy if exists "Group creators can update their groups" on public.study_groups;
drop policy if exists "Group creators can delete their groups" on public.study_groups;

create policy "Users can view groups they are members of"
  on public.study_groups for select
  using (
    exists (
      select 1 from public.study_group_members
      where group_id = id and user_id = auth.uid()
    )
  );

create policy "Anyone can view groups by invite code"
  on public.study_groups for select
  using (true);

create policy "Users can create groups"
  on public.study_groups for insert
  with check (auth.uid() = creator_id);

create policy "Group creators can update their groups"
  on public.study_groups for update
  using (auth.uid() = creator_id);

create policy "Group creators can delete their groups"
  on public.study_groups for delete
  using (auth.uid() = creator_id);

-- =====================================================
-- STEP 5: CREATE POLICIES FOR STUDY_GROUP_MEMBERS
-- =====================================================

drop policy if exists "Users can view members of groups they belong to" on public.study_group_members;
drop policy if exists "Users can join groups" on public.study_group_members;
drop policy if exists "Users can leave groups" on public.study_group_members;
drop policy if exists "Admins can remove members" on public.study_group_members;

create policy "Users can view members of groups they belong to"
  on public.study_group_members for select
  using (
    exists (
      select 1 from public.study_group_members m
      where m.group_id = study_group_members.group_id and m.user_id = auth.uid()
    )
  );

create policy "Users can join groups"
  on public.study_group_members for insert
  with check (auth.uid() = user_id);

create policy "Users can leave groups"
  on public.study_group_members for delete
  using (auth.uid() = user_id);

create policy "Admins can remove members"
  on public.study_group_members for delete
  using (
    exists (
      select 1 from public.study_group_members m
      where m.group_id = study_group_members.group_id and m.user_id = auth.uid() and m.role = 'admin'
    )
  );

-- =====================================================
-- STEP 6: CREATE POLICIES FOR STUDY_GROUP_SETS
-- =====================================================

drop policy if exists "Users can view sets in groups they belong to" on public.study_group_sets;
drop policy if exists "Group members can add sets" on public.study_group_sets;
drop policy if exists "Set adders or admins can remove sets" on public.study_group_sets;

create policy "Users can view sets in groups they belong to"
  on public.study_group_sets for select
  using (
    exists (
      select 1 from public.study_group_members m
      where m.group_id = study_group_sets.group_id and m.user_id = auth.uid()
    )
  );

create policy "Group members can add sets"
  on public.study_group_sets for insert
  with check (
    exists (
      select 1 from public.study_group_members m
      where m.group_id = study_group_sets.group_id and m.user_id = auth.uid()
    )
  );

create policy "Set adders or admins can remove sets"
  on public.study_group_sets for delete
  using (
    auth.uid() = added_by or
    exists (
      select 1 from public.study_group_members m
      where m.group_id = study_group_sets.group_id and m.user_id = auth.uid() and m.role = 'admin'
    )
  );

-- =====================================================
-- STEP 7: CREATE POLICIES FOR PENDING_INVITES
-- =====================================================

drop policy if exists "Anyone can create pending invites" on public.pending_invites;
drop policy if exists "Anyone can view pending invites" on public.pending_invites;

create policy "Anyone can create pending invites"
  on public.pending_invites for insert
  with check (true);

create policy "Anyone can view pending invites"
  on public.pending_invites for select
  using (true);

-- =====================================================
-- STEP 8: CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to generate unique invite code
create or replace function public.generate_invite_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  result text := '';
  i integer;
begin
  for i in 1..8 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  return result;
end;
$$;

-- Function to get group by invite code
create or replace function public.get_group_by_invite(p_invite_code text)
returns table (
  id uuid,
  name text,
  description text,
  creator_id uuid,
  member_count bigint
)
language plpgsql
security definer
as $$
begin
  return query
  select
    g.id,
    g.name,
    g.description,
    g.creator_id,
    (select count(*) from public.study_group_members m where m.group_id = g.id)
  from public.study_groups g
  where g.invite_code = p_invite_code;
end;
$$;

-- Function to join group by invite code
create or replace function public.join_group_by_invite(p_invite_code text)
returns uuid
language plpgsql
security definer
as $$
declare
  v_group_id uuid;
  v_user_id uuid := auth.uid();
  v_member_count integer;
  v_max_members integer;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Get group info
  select sg.id, sg.max_members into v_group_id, v_max_members
  from public.study_groups sg
  where sg.invite_code = p_invite_code;

  if v_group_id is null then
    raise exception 'Invalid invite code';
  end if;

  -- Check member count
  select count(*) into v_member_count
  from public.study_group_members
  where group_id = v_group_id;

  if v_member_count >= v_max_members then
    raise exception 'Group is full';
  end if;

  -- Check if already a member
  if exists (select 1 from public.study_group_members where group_id = v_group_id and user_id = v_user_id) then
    return v_group_id;
  end if;

  -- Add as member
  insert into public.study_group_members (group_id, user_id, role)
  values (v_group_id, v_user_id, 'member');

  return v_group_id;
end;
$$;

-- =====================================================
-- STEP 9: GRANT PERMISSIONS
-- =====================================================

grant execute on function public.generate_invite_code() to authenticated;
grant execute on function public.get_group_by_invite(text) to anon, authenticated;
grant execute on function public.join_group_by_invite(text) to authenticated;

-- =====================================================
-- STEP 10: CREATE TRIGGER FOR UPDATED_AT
-- =====================================================

drop trigger if exists handle_study_groups_updated_at on public.study_groups;
create trigger handle_study_groups_updated_at
  before update on public.study_groups
  for each row execute procedure public.handle_updated_at();

-- =====================================================
-- DONE! Study groups schema is now set up.
-- =====================================================
