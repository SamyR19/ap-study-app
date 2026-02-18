-- =====================================================
-- ACEAI COMPLETE DATABASE SCHEMA
-- Run this entire file in Supabase SQL Editor
-- =====================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE
-- Stores user profile information including username
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

-- Create index for faster username lookups
create index if not exists profiles_username_idx on public.profiles (username);
create index if not exists profiles_email_idx on public.profiles (email);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- =====================================================
-- 2. USER AP CLASSES TABLE
-- Stores which AP classes each user is taking
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

create policy "Users can view their own classes"
  on public.user_ap_classes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own classes"
  on public.user_ap_classes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own classes"
  on public.user_ap_classes for delete
  using (auth.uid() = user_id);

-- =====================================================
-- 3. USER PROGRESS TABLE
-- Tracks study progress for each topic
-- =====================================================
create table if not exists public.user_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  topic_id text not null,
  subject_id text not null,
  questions_attempted integer default 0,
  questions_correct integer default 0,
  mastery_level integer default 0, -- 0-100
  last_practiced timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, topic_id)
);

alter table public.user_progress enable row level security;

create policy "Users can view their own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert their own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on public.user_progress for update
  using (auth.uid() = user_id);

-- =====================================================
-- 4. STUDY SESSIONS TABLE
-- Tracks individual study sessions
-- =====================================================
create table if not exists public.study_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  subject_id text not null,
  topic_id text,
  session_type text not null, -- 'mcq', 'frq', 'flashcard', 'study_guide'
  duration_minutes integer default 0,
  questions_attempted integer default 0,
  questions_correct integer default 0,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone
);

alter table public.study_sessions enable row level security;

create policy "Users can view their own sessions"
  on public.study_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own sessions"
  on public.study_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own sessions"
  on public.study_sessions for update
  using (auth.uid() = user_id);

-- =====================================================
-- 5. USER STREAKS TABLE
-- Tracks daily study streaks
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

create policy "Users can view their own streaks"
  on public.user_streaks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own streaks"
  on public.user_streaks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own streaks"
  on public.user_streaks for update
  using (auth.uid() = user_id);

-- =====================================================
-- 6. FLASHCARD SETS TABLE
-- User-created flashcard sets
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

create policy "Users can view their own flashcard sets"
  on public.flashcard_sets for select
  using (auth.uid() = user_id or is_public = true);

create policy "Users can insert their own flashcard sets"
  on public.flashcard_sets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own flashcard sets"
  on public.flashcard_sets for update
  using (auth.uid() = user_id);

create policy "Users can delete their own flashcard sets"
  on public.flashcard_sets for delete
  using (auth.uid() = user_id);

-- =====================================================
-- 7. FLASHCARDS TABLE
-- Individual flashcards within sets
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

create policy "Users can view flashcards in their sets or public sets"
  on public.flashcards for select
  using (
    auth.uid() = user_id or
    exists (select 1 from public.flashcard_sets where id = set_id and is_public = true)
  );

create policy "Users can insert flashcards in their sets"
  on public.flashcards for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own flashcards"
  on public.flashcards for update
  using (auth.uid() = user_id);

create policy "Users can delete their own flashcards"
  on public.flashcards for delete
  using (auth.uid() = user_id);

-- =====================================================
-- 8. HELPER FUNCTIONS
-- =====================================================

-- Function to check if email is already registered
create or replace function public.check_email_exists(email_to_check text)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1 from auth.users where email = email_to_check
  );
end;
$$;

-- Function to check if username is already taken
create or replace function public.check_username_exists(username_to_check text)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1 from public.profiles where username = lower(username_to_check)
  );
end;
$$;

-- Function to create profile after signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );

  -- Also create initial streak record
  insert into public.user_streaks (user_id)
  values (new.id);

  return new;
end;
$$;

-- Trigger to create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update streak on study activity
create or replace function public.update_user_streak(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_last_date date;
  v_current_streak integer;
  v_longest_streak integer;
  v_today date := current_date;
begin
  select last_study_date, current_streak, longest_streak
  into v_last_date, v_current_streak, v_longest_streak
  from public.user_streaks
  where user_id = p_user_id;

  if v_last_date is null then
    -- First study day
    update public.user_streaks
    set current_streak = 1,
        longest_streak = 1,
        last_study_date = v_today,
        total_study_days = 1,
        updated_at = now()
    where user_id = p_user_id;
  elsif v_last_date = v_today then
    -- Already studied today, no change
    null;
  elsif v_last_date = v_today - interval '1 day' then
    -- Consecutive day
    update public.user_streaks
    set current_streak = current_streak + 1,
        longest_streak = greatest(longest_streak, current_streak + 1),
        last_study_date = v_today,
        total_study_days = total_study_days + 1,
        updated_at = now()
    where user_id = p_user_id;
  else
    -- Streak broken
    update public.user_streaks
    set current_streak = 1,
        last_study_date = v_today,
        total_study_days = total_study_days + 1,
        updated_at = now()
    where user_id = p_user_id;
  end if;
end;
$$;

-- =====================================================
-- 9. DELETE ACCOUNT FUNCTION
-- Completely removes user and all their data
-- =====================================================
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Delete from all tables (cascade should handle most, but being explicit)
  delete from public.flashcards where user_id = v_user_id;
  delete from public.flashcard_sets where user_id = v_user_id;
  delete from public.study_sessions where user_id = v_user_id;
  delete from public.user_progress where user_id = v_user_id;
  delete from public.user_streaks where user_id = v_user_id;
  delete from public.user_ap_classes where user_id = v_user_id;
  delete from public.profiles where id = v_user_id;

  -- Delete from auth.users (this requires service_role, but we try anyway)
  -- If this fails, the user will be orphaned in auth but data is gone
  delete from auth.users where id = v_user_id;
end;
$$;

-- Grant execute permissions
grant execute on function public.check_email_exists(text) to anon, authenticated;
grant execute on function public.check_username_exists(text) to anon, authenticated;
grant execute on function public.delete_my_account() to authenticated;
grant execute on function public.update_user_streak(uuid) to authenticated;

-- =====================================================
-- 10. UPDATED_AT TRIGGER
-- Automatically updates the updated_at column
-- =====================================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at trigger to relevant tables
drop trigger if exists handle_profiles_updated_at on public.profiles;
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_user_progress_updated_at on public.user_progress;
create trigger handle_user_progress_updated_at
  before update on public.user_progress
  for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_user_streaks_updated_at on public.user_streaks;
create trigger handle_user_streaks_updated_at
  before update on public.user_streaks
  for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_flashcard_sets_updated_at on public.flashcard_sets;
create trigger handle_flashcard_sets_updated_at
  before update on public.flashcard_sets
  for each row execute procedure public.handle_updated_at();

-- =====================================================
-- DONE! Your database is now set up.
-- =====================================================
