-- Live Quizzes Schema for Study Groups
-- Run this in Supabase SQL Editor

-- Table to store quiz templates (replayable)
CREATE TABLE IF NOT EXISTS live_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,

  -- Quiz configuration
  question_type TEXT NOT NULL DEFAULT 'mcq' CHECK (question_type IN ('mcq', 'frq', 'mixed')),
  time_per_question INTEGER NOT NULL DEFAULT 15, -- seconds for MCQ
  frq_time_limit INTEGER DEFAULT 300, -- seconds for FRQ (5 min default)
  points_per_question INTEGER NOT NULL DEFAULT 100,
  speed_bonus BOOLEAN DEFAULT true, -- bonus points for fast answers

  -- Source configuration
  source_type TEXT NOT NULL CHECK (source_type IN ('flashcards', 'ai', 'custom')),
  source_set_id UUID REFERENCES flashcard_sets(id),
  source_prompt TEXT, -- for AI-generated quizzes
  source_units TEXT[], -- specific units/topics

  -- Questions stored as JSONB
  questions JSONB NOT NULL DEFAULT '[]',

  -- Metadata
  total_plays INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to store active quiz sessions
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES live_quizzes(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES auth.users(id),

  -- Session state
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'showing_leaderboard', 'finished')),
  current_question_index INTEGER DEFAULT 0,
  question_started_at TIMESTAMPTZ,

  -- Timing
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to store participants in a quiz session
CREATE TABLE IF NOT EXISTS quiz_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),

  -- Score tracking
  total_score INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_answered INTEGER DEFAULT 0,

  -- Current question state
  current_answer JSONB, -- stores answer for current question
  answered_at TIMESTAMPTZ,

  joined_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(session_id, user_id)
);

-- Table to store individual answers for analytics
CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  question_index INTEGER NOT NULL,

  -- Answer data
  answer JSONB NOT NULL, -- MCQ: {index: 0}, FRQ: {code: "...", output: "..."}
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  time_taken_ms INTEGER, -- milliseconds to answer

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for per-user quiz analytics
CREATE TABLE IF NOT EXISTS user_quiz_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,

  -- Aggregate stats
  total_quizzes_taken INTEGER DEFAULT 0,
  total_questions_answered INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,

  -- Best performances
  highest_score INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,

  -- By question type
  mcq_correct INTEGER DEFAULT 0,
  mcq_total INTEGER DEFAULT 0,
  frq_correct INTEGER DEFAULT 0,
  frq_total INTEGER DEFAULT 0,

  -- Timing stats
  avg_answer_time_ms INTEGER,
  fastest_correct_ms INTEGER,

  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, group_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_live_quizzes_group ON live_quizzes(group_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_quiz ON quiz_sessions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_status ON quiz_sessions(status);
CREATE INDEX IF NOT EXISTS idx_quiz_participants_session ON quiz_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_participants_user ON quiz_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_session ON quiz_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_stats_user ON user_quiz_stats(user_id);

-- RLS Policies
ALTER TABLE live_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_stats ENABLE ROW LEVEL SECURITY;

-- Users can view quizzes in groups they belong to
CREATE POLICY "Users can view group quizzes" ON live_quizzes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE study_group_members.group_id = live_quizzes.group_id
      AND study_group_members.user_id = auth.uid()
    )
  );

-- Users can create quizzes in groups they belong to
CREATE POLICY "Users can create group quizzes" ON live_quizzes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE study_group_members.group_id = live_quizzes.group_id
      AND study_group_members.user_id = auth.uid()
    )
  );

-- Similar policies for other tables
CREATE POLICY "Users can view sessions" ON quiz_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM live_quizzes lq
      JOIN study_group_members sgm ON sgm.group_id = lq.group_id
      WHERE lq.id = quiz_sessions.quiz_id AND sgm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create sessions" ON quiz_sessions
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Users can update their hosted sessions" ON quiz_sessions
  FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Users can view participants" ON quiz_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quiz_sessions qs
      JOIN live_quizzes lq ON lq.id = qs.quiz_id
      JOIN study_group_members sgm ON sgm.group_id = lq.group_id
      WHERE qs.id = quiz_participants.session_id AND sgm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their participation" ON quiz_participants
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view answers in their sessions" ON quiz_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quiz_participants qp
      WHERE qp.session_id = quiz_answers.session_id AND qp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their answers" ON quiz_answers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own stats" ON user_quiz_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON user_quiz_stats
  FOR ALL USING (auth.uid() = user_id);
