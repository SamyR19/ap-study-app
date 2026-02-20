-- =====================================================
-- ACEAI COMPLETE DATABASE SCHEMA
-- Run this entire file in Supabase SQL Editor
-- Safe to re-run (drops policies before creating)
-- =====================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  username text unique not null,
  full_name text,
  avatar_url text,
  grade_level text,
  school text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists profiles_username_idx on public.profiles (username);
create index if not exists profiles_email_idx on public.profiles (email);
alter table public.profiles enable row level security;

-- Drop existing policies first
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;

create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);

-- =====================================================
-- 2. USER AP CLASSES TABLE
-- =====================================================
create table if not exists public.user_ap_classes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  class_id text not null,
  class_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, class_id)
);

alter table public.user_ap_classes enable row level security;

drop policy if exists "Users can view their own classes" on public.user_ap_classes;
drop policy if exists "Users can insert their own classes" on public.user_ap_classes;
drop policy if exists "Users can delete their own classes" on public.user_ap_classes;

create policy "Users can view their own classes" on public.user_ap_classes for select using (auth.uid() = user_id);
create policy "Users can insert their own classes" on public.user_ap_classes for insert with check (auth.uid() = user_id);
create policy "Users can delete their own classes" on public.user_ap_classes for delete using (auth.uid() = user_id);

-- =====================================================
-- 3. USER PROGRESS TABLE
-- =====================================================
create table if not exists public.user_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  topic_id text not null,
  subject_id text not null,
  questions_attempted integer default 0,
  questions_correct integer default 0,
  mastery_level integer default 0,
  last_practiced timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, topic_id)
);

alter table public.user_progress enable row level security;

drop policy if exists "Users can view their own progress" on public.user_progress;
drop policy if exists "Users can insert their own progress" on public.user_progress;
drop policy if exists "Users can update their own progress" on public.user_progress;

create policy "Users can view their own progress" on public.user_progress for select using (auth.uid() = user_id);
create policy "Users can insert their own progress" on public.user_progress for insert with check (auth.uid() = user_id);
create policy "Users can update their own progress" on public.user_progress for update using (auth.uid() = user_id);

-- =====================================================
-- 4. STUDY SESSIONS TABLE
-- =====================================================
create table if not exists public.study_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  subject_id text not null,
  topic_id text,
  session_type text not null,
  duration_minutes integer default 0,
  questions_attempted integer default 0,
  questions_correct integer default 0,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone
);

alter table public.study_sessions enable row level security;

drop policy if exists "Users can view their own sessions" on public.study_sessions;
drop policy if exists "Users can insert their own sessions" on public.study_sessions;
drop policy if exists "Users can update their own sessions" on public.study_sessions;

create policy "Users can view their own sessions" on public.study_sessions for select using (auth.uid() = user_id);
create policy "Users can insert their own sessions" on public.study_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update their own sessions" on public.study_sessions for update using (auth.uid() = user_id);

-- =====================================================
-- 5. USER STREAKS TABLE
-- =====================================================
create table if not exists public.user_streaks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_study_date date,
  total_study_days integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_streaks enable row level security;

drop policy if exists "Users can view their own streaks" on public.user_streaks;
drop policy if exists "Users can insert their own streaks" on public.user_streaks;
drop policy if exists "Users can update their own streaks" on public.user_streaks;

create policy "Users can view their own streaks" on public.user_streaks for select using (auth.uid() = user_id);
create policy "Users can insert their own streaks" on public.user_streaks for insert with check (auth.uid() = user_id);
create policy "Users can update their own streaks" on public.user_streaks for update using (auth.uid() = user_id);

-- =====================================================
-- 6. FLASHCARD SETS TABLE
-- =====================================================
create table if not exists public.flashcard_sets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  subject_id text,
  is_public boolean default false,
  card_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.flashcard_sets enable row level security;

drop policy if exists "Users can view their own flashcard sets" on public.flashcard_sets;
drop policy if exists "Users can insert their own flashcard sets" on public.flashcard_sets;
drop policy if exists "Users can update their own flashcard sets" on public.flashcard_sets;
drop policy if exists "Users can delete their own flashcard sets" on public.flashcard_sets;

create policy "Users can view their own flashcard sets" on public.flashcard_sets for select using (auth.uid() = user_id or is_public = true);
create policy "Users can insert their own flashcard sets" on public.flashcard_sets for insert with check (auth.uid() = user_id);
create policy "Users can update their own flashcard sets" on public.flashcard_sets for update using (auth.uid() = user_id);
create policy "Users can delete their own flashcard sets" on public.flashcard_sets for delete using (auth.uid() = user_id);

-- =====================================================
-- 7. FLASHCARDS TABLE
-- =====================================================
create table if not exists public.flashcards (
  id uuid default uuid_generate_v4() primary key,
  set_id uuid references public.flashcard_sets(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  front text not null,
  back text not null,
  position integer default 0,
  times_reviewed integer default 0,
  times_correct integer default 0,
  last_reviewed timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.flashcards enable row level security;

drop policy if exists "Users can view flashcards in their sets or public sets" on public.flashcards;
drop policy if exists "Users can insert flashcards in their sets" on public.flashcards;
drop policy if exists "Users can update their own flashcards" on public.flashcards;
drop policy if exists "Users can delete their own flashcards" on public.flashcards;

create policy "Users can view flashcards in their sets or public sets" on public.flashcards for select
  using (auth.uid() = user_id or exists (select 1 from public.flashcard_sets where id = set_id and is_public = true));
create policy "Users can insert flashcards in their sets" on public.flashcards for insert with check (auth.uid() = user_id);
create policy "Users can update their own flashcards" on public.flashcards for update using (auth.uid() = user_id);
create policy "Users can delete their own flashcards" on public.flashcards for delete using (auth.uid() = user_id);

-- =====================================================
-- 8. STUDY GROUPS TABLE
-- =====================================================
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

create index if not exists study_groups_invite_code_idx on public.study_groups (invite_code);
create index if not exists study_groups_creator_idx on public.study_groups (creator_id);
alter table public.study_groups enable row level security;

drop policy if exists "Users can view groups they are members of" on public.study_groups;
drop policy if exists "Anyone can view groups by invite code" on public.study_groups;
drop policy if exists "Users can create groups" on public.study_groups;
drop policy if exists "Group creators can update their groups" on public.study_groups;
drop policy if exists "Group creators can delete their groups" on public.study_groups;

create policy "Anyone can view groups by invite code" on public.study_groups for select using (true);
create policy "Users can create groups" on public.study_groups for insert with check (auth.uid() = creator_id);
create policy "Group creators can update their groups" on public.study_groups for update using (auth.uid() = creator_id);
create policy "Group creators can delete their groups" on public.study_groups for delete using (auth.uid() = creator_id);

-- =====================================================
-- 9. STUDY GROUP MEMBERS TABLE
-- =====================================================
create table if not exists public.study_group_members (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.study_groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member' not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(group_id, user_id)
);

create index if not exists study_group_members_group_idx on public.study_group_members (group_id);
create index if not exists study_group_members_user_idx on public.study_group_members (user_id);
alter table public.study_group_members enable row level security;

drop policy if exists "Users can view members of groups they belong to" on public.study_group_members;
drop policy if exists "Anyone can view group members" on public.study_group_members;
drop policy if exists "Users can join groups" on public.study_group_members;
drop policy if exists "Users can leave groups" on public.study_group_members;
drop policy if exists "Admins can remove members" on public.study_group_members;

create policy "Anyone can view group members" on public.study_group_members for select using (true);
create policy "Users can join groups" on public.study_group_members for insert with check (auth.uid() = user_id);
create policy "Users can leave groups" on public.study_group_members for delete using (auth.uid() = user_id);
create policy "Admins can remove members" on public.study_group_members for delete
  using (exists (select 1 from public.study_group_members m where m.group_id = group_id and m.user_id = auth.uid() and m.role = 'admin'));

-- =====================================================
-- 10. STUDY GROUP SETS TABLE
-- =====================================================
create table if not exists public.study_group_sets (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.study_groups(id) on delete cascade not null,
  set_id uuid references public.flashcard_sets(id) on delete cascade not null,
  added_by uuid references public.profiles(id) on delete cascade not null,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(group_id, set_id)
);

create index if not exists study_group_sets_group_idx on public.study_group_sets (group_id);
alter table public.study_group_sets enable row level security;

drop policy if exists "Users can view sets in groups they belong to" on public.study_group_sets;
drop policy if exists "Group members can add sets" on public.study_group_sets;
drop policy if exists "Set adders or admins can remove sets" on public.study_group_sets;

create policy "Users can view sets in groups they belong to" on public.study_group_sets for select
  using (exists (select 1 from public.study_group_members m where m.group_id = group_id and m.user_id = auth.uid()));
create policy "Group members can add sets" on public.study_group_sets for insert
  with check (exists (select 1 from public.study_group_members m where m.group_id = group_id and m.user_id = auth.uid()));
create policy "Set adders or admins can remove sets" on public.study_group_sets for delete
  using (auth.uid() = added_by or exists (select 1 from public.study_group_members m where m.group_id = group_id and m.user_id = auth.uid() and m.role = 'admin'));

-- =====================================================
-- 11. PENDING INVITES TABLE
-- =====================================================
create table if not exists public.pending_invites (
  id uuid default uuid_generate_v4() primary key,
  invite_code text not null,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone default (timezone('utc'::text, now()) + interval '7 days') not null
);

create index if not exists pending_invites_code_idx on public.pending_invites (invite_code);
alter table public.pending_invites enable row level security;

drop policy if exists "Anyone can create pending invites" on public.pending_invites;
drop policy if exists "Anyone can view pending invites" on public.pending_invites;

create policy "Anyone can create pending invites" on public.pending_invites for insert with check (true);
create policy "Anyone can view pending invites" on public.pending_invites for select using (true);

-- =====================================================
-- 12. HELPER FUNCTIONS
-- =====================================================

create or replace function public.check_email_exists(email_to_check text)
returns boolean language plpgsql security definer as $$
begin
  return exists (select 1 from auth.users where email = email_to_check);
end;
$$;

create or replace function public.check_username_exists(username_to_check text)
returns boolean language plpgsql security definer as $$
begin
  return exists (select 1 from public.profiles where username = lower(username_to_check));
end;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, username, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  insert into public.user_streaks (user_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.update_user_streak(p_user_id uuid)
returns void language plpgsql security definer as $$
declare
  v_last_date date;
  v_current_streak integer;
  v_longest_streak integer;
  v_today date := current_date;
begin
  select last_study_date, current_streak, longest_streak
  into v_last_date, v_current_streak, v_longest_streak
  from public.user_streaks where user_id = p_user_id;

  if v_last_date is null then
    update public.user_streaks set current_streak = 1, longest_streak = 1, last_study_date = v_today, total_study_days = 1, updated_at = now() where user_id = p_user_id;
  elsif v_last_date = v_today then
    null;
  elsif v_last_date = v_today - interval '1 day' then
    update public.user_streaks set current_streak = current_streak + 1, longest_streak = greatest(longest_streak, current_streak + 1), last_study_date = v_today, total_study_days = total_study_days + 1, updated_at = now() where user_id = p_user_id;
  else
    update public.user_streaks set current_streak = 1, last_study_date = v_today, total_study_days = total_study_days + 1, updated_at = now() where user_id = p_user_id;
  end if;
end;
$$;

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.generate_invite_code()
returns text language plpgsql as $$
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

create or replace function public.get_group_by_invite(p_invite_code text)
returns table (id uuid, name text, description text, creator_id uuid, member_count bigint)
language plpgsql security definer as $$
begin
  return query
  select g.id, g.name, g.description, g.creator_id,
    (select count(*) from public.study_group_members m where m.group_id = g.id)
  from public.study_groups g where g.invite_code = p_invite_code;
end;
$$;

create or replace function public.join_group_by_invite(p_invite_code text)
returns uuid language plpgsql security definer as $$
declare
  v_group_id uuid;
  v_user_id uuid := auth.uid();
  v_member_count integer;
  v_max_members integer;
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  select id, max_members into v_group_id, v_max_members from public.study_groups where invite_code = p_invite_code;
  if v_group_id is null then raise exception 'Invalid invite code'; end if;
  select count(*) into v_member_count from public.study_group_members where group_id = v_group_id;
  if v_member_count >= v_max_members then raise exception 'Group is full'; end if;
  if exists (select 1 from public.study_group_members where group_id = v_group_id and user_id = v_user_id) then return v_group_id; end if;
  insert into public.study_group_members (group_id, user_id, role) values (v_group_id, v_user_id, 'member');
  return v_group_id;
end;
$$;

-- =====================================================
-- 13. TRIGGERS
-- =====================================================

drop trigger if exists handle_profiles_updated_at on public.profiles;
create trigger handle_profiles_updated_at before update on public.profiles for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_user_progress_updated_at on public.user_progress;
create trigger handle_user_progress_updated_at before update on public.user_progress for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_user_streaks_updated_at on public.user_streaks;
create trigger handle_user_streaks_updated_at before update on public.user_streaks for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_flashcard_sets_updated_at on public.flashcard_sets;
create trigger handle_flashcard_sets_updated_at before update on public.flashcard_sets for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_study_groups_updated_at on public.study_groups;
create trigger handle_study_groups_updated_at before update on public.study_groups for each row execute procedure public.handle_updated_at();

-- =====================================================
-- 14. GRANT PERMISSIONS
-- =====================================================

grant execute on function public.check_email_exists(text) to anon, authenticated;
grant execute on function public.check_username_exists(text) to anon, authenticated;
grant execute on function public.update_user_streak(uuid) to authenticated;
grant execute on function public.generate_invite_code() to authenticated;
grant execute on function public.get_group_by_invite(text) to anon, authenticated;
grant execute on function public.join_group_by_invite(text) to authenticated;

-- =====================================================
-- DONE! Your database is now set up.
-- =====================================================
