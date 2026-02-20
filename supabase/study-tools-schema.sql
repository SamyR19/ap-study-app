-- =====================================================
-- STUDY TOOLS SCHEMA
-- Tables for Study Guides, Practice Tests, and Folders
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. STUDY GUIDES TABLE
-- =====================================================
create table if not exists public.study_guides (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  source_text text,
  source_type text default 'text' check (source_type in ('text', 'file')),
  outline_content jsonb default '{"sections": []}'::jsonb,
  quick_reference jsonb default '{"keyTerms": [], "factsToMemorize": [], "causeEffect": []}'::jsonb,
  ap_class text default 'ap-csa',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists study_guides_user_idx on public.study_guides (user_id);
create index if not exists study_guides_class_idx on public.study_guides (ap_class);
create index if not exists study_guides_created_idx on public.study_guides (created_at desc);
alter table public.study_guides enable row level security;

-- RLS Policies for study_guides
drop policy if exists "Users can view their own study guides" on public.study_guides;
drop policy if exists "Users can insert their own study guides" on public.study_guides;
drop policy if exists "Users can update their own study guides" on public.study_guides;
drop policy if exists "Users can delete their own study guides" on public.study_guides;

create policy "Users can view their own study guides" on public.study_guides
  for select using (auth.uid() = user_id);
create policy "Users can insert their own study guides" on public.study_guides
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own study guides" on public.study_guides
  for update using (auth.uid() = user_id);
create policy "Users can delete their own study guides" on public.study_guides
  for delete using (auth.uid() = user_id);

-- =====================================================
-- 2. PRACTICE TESTS TABLE
-- =====================================================
create table if not exists public.practice_tests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  settings jsonb not null default '{"questionCount": 10, "timerMinutes": null, "questionTypes": ["mcq"]}'::jsonb,
  source_set_ids uuid[] default '{}',
  source_guide_ids uuid[] default '{}',
  questions jsonb not null default '[]'::jsonb,
  ap_class text default 'ap-csa',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists practice_tests_user_idx on public.practice_tests (user_id);
create index if not exists practice_tests_created_idx on public.practice_tests (created_at desc);
alter table public.practice_tests enable row level security;

-- RLS Policies for practice_tests
drop policy if exists "Users can view their own practice tests" on public.practice_tests;
drop policy if exists "Users can insert their own practice tests" on public.practice_tests;
drop policy if exists "Users can update their own practice tests" on public.practice_tests;
drop policy if exists "Users can delete their own practice tests" on public.practice_tests;

create policy "Users can view their own practice tests" on public.practice_tests
  for select using (auth.uid() = user_id);
create policy "Users can insert their own practice tests" on public.practice_tests
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own practice tests" on public.practice_tests
  for update using (auth.uid() = user_id);
create policy "Users can delete their own practice tests" on public.practice_tests
  for delete using (auth.uid() = user_id);

-- =====================================================
-- 3. PRACTICE TEST ATTEMPTS TABLE
-- =====================================================
create table if not exists public.practice_test_attempts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  test_id uuid references public.practice_tests(id) on delete cascade not null,
  answers jsonb not null default '[]'::jsonb,
  score integer default 0,
  max_score integer default 0,
  time_taken_seconds integer,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists practice_test_attempts_user_idx on public.practice_test_attempts (user_id);
create index if not exists practice_test_attempts_test_idx on public.practice_test_attempts (test_id);
alter table public.practice_test_attempts enable row level security;

-- RLS Policies for practice_test_attempts
drop policy if exists "Users can view their own attempts" on public.practice_test_attempts;
drop policy if exists "Users can insert their own attempts" on public.practice_test_attempts;
drop policy if exists "Users can update their own attempts" on public.practice_test_attempts;

create policy "Users can view their own attempts" on public.practice_test_attempts
  for select using (auth.uid() = user_id);
create policy "Users can insert their own attempts" on public.practice_test_attempts
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own attempts" on public.practice_test_attempts
  for update using (auth.uid() = user_id);

-- =====================================================
-- 4. FOLDERS TABLE
-- =====================================================
create table if not exists public.folders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  color text default '#E07856',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists folders_user_idx on public.folders (user_id);
alter table public.folders enable row level security;

-- RLS Policies for folders
drop policy if exists "Users can view their own folders" on public.folders;
drop policy if exists "Users can insert their own folders" on public.folders;
drop policy if exists "Users can update their own folders" on public.folders;
drop policy if exists "Users can delete their own folders" on public.folders;

create policy "Users can view their own folders" on public.folders
  for select using (auth.uid() = user_id);
create policy "Users can insert their own folders" on public.folders
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own folders" on public.folders
  for update using (auth.uid() = user_id);
create policy "Users can delete their own folders" on public.folders
  for delete using (auth.uid() = user_id);

-- =====================================================
-- 5. FOLDER ITEMS TABLE (Junction table)
-- =====================================================
create table if not exists public.folder_items (
  id uuid default uuid_generate_v4() primary key,
  folder_id uuid references public.folders(id) on delete cascade not null,
  item_type text not null check (item_type in ('flashcard_set', 'study_guide', 'practice_test')),
  item_id uuid not null,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(folder_id, item_type, item_id)
);

create index if not exists folder_items_folder_idx on public.folder_items (folder_id);
alter table public.folder_items enable row level security;

-- RLS Policies for folder_items
drop policy if exists "Users can view their folder items" on public.folder_items;
drop policy if exists "Users can insert their folder items" on public.folder_items;
drop policy if exists "Users can delete their folder items" on public.folder_items;

create policy "Users can view their folder items" on public.folder_items
  for select using (
    exists (select 1 from public.folders f where f.id = folder_id and f.user_id = auth.uid())
  );
create policy "Users can insert their folder items" on public.folder_items
  for insert with check (
    exists (select 1 from public.folders f where f.id = folder_id and f.user_id = auth.uid())
  );
create policy "Users can delete their folder items" on public.folder_items
  for delete using (
    exists (select 1 from public.folders f where f.id = folder_id and f.user_id = auth.uid())
  );

-- =====================================================
-- 6. UPDATE TRIGGERS
-- =====================================================
drop trigger if exists handle_study_guides_updated_at on public.study_guides;
create trigger handle_study_guides_updated_at
  before update on public.study_guides
  for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_practice_tests_updated_at on public.practice_tests;
create trigger handle_practice_tests_updated_at
  before update on public.practice_tests
  for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_folders_updated_at on public.folders;
create trigger handle_folders_updated_at
  before update on public.folders
  for each row execute procedure public.handle_updated_at();
