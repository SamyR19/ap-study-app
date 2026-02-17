-- ============================================
-- AP Study App - Supabase Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & PROFILES
-- ============================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences
CREATE TABLE user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  notifications_enabled BOOLEAN DEFAULT true,
  daily_goal_minutes INTEGER DEFAULT 30,
  preferred_subjects TEXT[] DEFAULT '{}',
  study_reminder_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================

CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 month',
  cancel_at_period_end BOOLEAN DEFAULT false,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- QUESTIONS
-- ============================================

-- Multiple Choice Questions
CREATE TABLE mcq_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_html TEXT,
  choices JSONB NOT NULL, -- Array of {index, text, text_html}
  correct_answer_index INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  explanation_html TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags TEXT[] DEFAULT '{}',
  code_snippet TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Free Response Questions
CREATE TABLE frq_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  prompt_html TEXT,
  starter_code TEXT,
  language TEXT DEFAULT 'java' CHECK (language IN ('java', 'python', 'javascript')),
  rubric JSONB NOT NULL, -- Array of {id, description, points, criteria}
  test_cases JSONB NOT NULL, -- Array of {id, input, expected_output, is_hidden, description, points}
  sample_solution TEXT,
  total_points INTEGER NOT NULL,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  time_estimate_minutes INTEGER DEFAULT 15,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- USER PROGRESS & SUBMISSIONS
-- ============================================

-- Topic mastery progress
CREATE TABLE user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  mastery_percentage INTEGER DEFAULT 0 CHECK (mastery_percentage >= 0 AND mastery_percentage <= 100),
  questions_attempted INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  last_practiced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  streak_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subject, topic_id)
);

-- MCQ Submissions
CREATE TABLE mcq_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES mcq_questions(id) ON DELETE CASCADE NOT NULL,
  selected_answer_index INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FRQ Submissions
CREATE TABLE frq_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES frq_questions(id) ON DELETE CASCADE NOT NULL,
  submitted_code TEXT NOT NULL,
  language TEXT NOT NULL,
  test_results JSONB, -- Array of {test_case_id, passed, actual_output, error_message, execution_time_ms}
  rubric_scores JSONB, -- Array of {rubric_item_id, points_earned, feedback}
  total_score INTEGER,
  max_score INTEGER,
  ai_feedback TEXT,
  time_taken_seconds INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'correct', 'incorrect', 'partial')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STUDY STREAKS & SESSIONS
-- ============================================

CREATE TABLE study_streaks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_study_date DATE DEFAULT CURRENT_DATE,
  total_study_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE study_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  topic_id TEXT,
  mode TEXT DEFAULT 'practice' CHECK (mode IN ('practice', 'timed', 'review')),
  questions_answered INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_mcq_questions_subject ON mcq_questions(subject);
CREATE INDEX idx_mcq_questions_topic ON mcq_questions(topic_id);
CREATE INDEX idx_mcq_questions_difficulty ON mcq_questions(difficulty);

CREATE INDEX idx_frq_questions_subject ON frq_questions(subject);
CREATE INDEX idx_frq_questions_topic ON frq_questions(topic_id);

CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_subject ON user_progress(subject);
CREATE INDEX idx_user_progress_topic ON user_progress(user_id, topic_id);

CREATE INDEX idx_mcq_submissions_user ON mcq_submissions(user_id);
CREATE INDEX idx_mcq_submissions_question ON mcq_submissions(question_id);

CREATE INDEX idx_frq_submissions_user ON frq_submissions(user_id);
CREATE INDEX idx_frq_submissions_question ON frq_submissions(question_id);

CREATE INDEX idx_study_sessions_user ON study_sessions(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcq_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE frq_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Progress policies
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR ALL USING (auth.uid() = user_id);

-- MCQ submissions policies
CREATE POLICY "Users can view own mcq submissions" ON mcq_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mcq submissions" ON mcq_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- FRQ submissions policies
CREATE POLICY "Users can view own frq submissions" ON frq_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own frq submissions" ON frq_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Study streaks policies
CREATE POLICY "Users can view own streaks" ON study_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON study_streaks
  FOR ALL USING (auth.uid() = user_id);

-- Study sessions policies
CREATE POLICY "Users can view own sessions" ON study_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sessions" ON study_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Questions are readable by all authenticated users
CREATE POLICY "Anyone can read mcq questions" ON mcq_questions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read frq questions" ON frq_questions
  FOR SELECT USING (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);

  INSERT INTO public.subscriptions (user_id)
  VALUES (NEW.id);

  INSERT INTO public.study_streaks (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_streaks_updated_at
  BEFORE UPDATE ON study_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
