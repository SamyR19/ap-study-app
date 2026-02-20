-- ============================================
-- AP CSA Course Tables Migration
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Course Onboarding / User Preferences
CREATE TABLE IF NOT EXISTS course_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  curriculum_version TEXT NOT NULL DEFAULT '4-unit' CHECK (curriculum_version IN ('4-unit', '9-unit')),
  current_unit INT NOT NULL DEFAULT 1,
  has_completed_assessment BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Assessment Results
CREATE TABLE IF NOT EXISTS assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  curriculum_version TEXT NOT NULL,
  current_unit INT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]', -- [{question_id, topic_id, selected, correct, is_correct}]
  total_questions INT NOT NULL DEFAULT 0,
  correct_answers INT NOT NULL DEFAULT 0,
  score_percentage INT NOT NULL DEFAULT 0,
  strong_topics TEXT[] DEFAULT '{}',
  weak_topics TEXT[] DEFAULT '{}',
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Topic Progress
CREATE TABLE IF NOT EXISTS topic_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id TEXT NOT NULL,
  mastery_level TEXT DEFAULT 'not_started' CHECK (mastery_level IN ('not_started', 'learning', 'familiar', 'mastered')),
  mastery_percentage INT DEFAULT 0 CHECK (mastery_percentage >= 0 AND mastery_percentage <= 100),
  flashcard_sets_count INT DEFAULT 0,
  study_guides_count INT DEFAULT 0,
  practice_tests_count INT DEFAULT 0,
  code_challenges_completed INT DEFAULT 0,
  code_challenges_due INT DEFAULT 0,
  last_studied TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

-- 4. Code Challenges (Seed data - challenges for practice)
CREATE TABLE IF NOT EXISTS code_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  challenge_type TEXT DEFAULT 'write_method' CHECK (challenge_type IN ('write_method', 'fix_bug', 'predict_output', 'complete_code')),
  starter_code TEXT,
  solution_code TEXT,
  test_cases JSONB DEFAULT '[]',
  hints TEXT[] DEFAULT '{}',
  concepts_tested TEXT[] DEFAULT '{}',
  estimated_minutes INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Code Challenge Progress (SM-2 spaced repetition tracking)
CREATE TABLE IF NOT EXISTS code_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES code_challenges(id) ON DELETE CASCADE NOT NULL,
  ease_factor DECIMAL DEFAULT 2.5,
  interval INT DEFAULT 1, -- days until next review
  repetitions INT DEFAULT 0, -- consecutive correct reviews
  next_review_date DATE DEFAULT CURRENT_DATE,
  attempts INT DEFAULT 0,
  successful_attempts INT DEFAULT 0,
  last_attempt_code TEXT,
  last_attempt_passed BOOLEAN DEFAULT false,
  last_attempt_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- 6. User Milestones
CREATE TABLE IF NOT EXISTS user_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('unit_complete', 'streak', 'challenges', 'mastery', 'custom')),
  milestone_id TEXT NOT NULL, -- e.g., 'unit-1-complete', 'streak-7', 'challenges-10'
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, milestone_id)
);

-- 7. Study Sessions (for streak tracking)
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id TEXT,
  session_type TEXT CHECK (session_type IN ('flashcards', 'code_practice', 'study_guide', 'practice_test', 'ai_tutor')),
  duration_seconds INT DEFAULT 0,
  session_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

ALTER TABLE course_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Course Onboarding policies
CREATE POLICY "Users can view own onboarding" ON course_onboarding
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own onboarding" ON course_onboarding
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own onboarding" ON course_onboarding
  FOR UPDATE USING (auth.uid() = user_id);

-- Assessment Results policies
CREATE POLICY "Users can view own assessments" ON assessment_results
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assessments" ON assessment_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Topic Progress policies
CREATE POLICY "Users can view own topic progress" ON topic_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own topic progress" ON topic_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own topic progress" ON topic_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Code Challenges policies (readable by all authenticated users)
CREATE POLICY "Authenticated users can view challenges" ON code_challenges
  FOR SELECT USING (auth.role() = 'authenticated');

-- Code Challenge Progress policies
CREATE POLICY "Users can view own challenge progress" ON code_challenge_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own challenge progress" ON code_challenge_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own challenge progress" ON code_challenge_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- User Milestones policies
CREATE POLICY "Users can view own milestones" ON user_milestones
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own milestones" ON user_milestones
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own milestones" ON user_milestones
  FOR UPDATE USING (auth.uid() = user_id);

-- Study Sessions policies
CREATE POLICY "Users can view own study sessions" ON study_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own study sessions" ON study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_topic_progress_user ON topic_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_progress_topic ON topic_progress(topic_id);
CREATE INDEX IF NOT EXISTS idx_code_challenge_progress_user ON code_challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_code_challenge_progress_review ON code_challenge_progress(next_review_date);
CREATE INDEX IF NOT EXISTS idx_assessment_results_user ON assessment_results(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date ON study_sessions(user_id, session_date);

-- ============================================
-- Seed Data: Code Challenges
-- ============================================

INSERT INTO code_challenges (id, topic_id, title, description, difficulty, challenge_type, starter_code, solution_code, test_cases, hints, concepts_tested, estimated_minutes)
VALUES
-- Unit 1: Primitive Types
('11111111-1111-1111-1111-111111111101', 'csa-1-2', 'Variable Swap', 'Swap the values of two integer variables without using a third variable.', 'easy', 'write_method',
'public static void swap() {
    int a = 5;
    int b = 10;
    // Swap a and b here

    System.out.println("a = " + a); // Should print 10
    System.out.println("b = " + b); // Should print 5
}',
'public static void swap() {
    int a = 5;
    int b = 10;
    a = a + b;
    b = a - b;
    a = a - b;
    System.out.println("a = " + a);
    System.out.println("b = " + b);
}',
'[{"input": "", "expected": "a = 10\nb = 5", "description": "Values should be swapped"}]',
ARRAY['Think about arithmetic operations', 'a + b gives you the sum...'],
ARRAY['Variables', 'Arithmetic'],
5),

('11111111-1111-1111-1111-111111111102', 'csa-1-5', 'Integer Division', 'Calculate the quotient and remainder of dividing 17 by 5.', 'easy', 'write_method',
'public static void division() {
    int dividend = 17;
    int divisor = 5;
    // Calculate quotient and remainder
    int quotient = // your code
    int remainder = // your code

    System.out.println("Quotient: " + quotient);
    System.out.println("Remainder: " + remainder);
}',
'public static void division() {
    int dividend = 17;
    int divisor = 5;
    int quotient = dividend / divisor;
    int remainder = dividend % divisor;
    System.out.println("Quotient: " + quotient);
    System.out.println("Remainder: " + remainder);
}',
'[{"input": "", "expected": "Quotient: 3\nRemainder: 2", "description": "17 / 5 = 3 remainder 2"}]',
ARRAY['Use / for integer division', 'Use % for modulo (remainder)'],
ARRAY['Integer Division', 'Modulo Operator'],
5),

-- Unit 2: Objects, Strings, Loops
('11111111-1111-1111-1111-111111111201', 'csa-2-7', 'String Reverse', 'Write a method that reverses a string using String methods.', 'medium', 'write_method',
'public static String reverse(String s) {
    // Return the reversed string

}',
'public static String reverse(String s) {
    String result = "";
    for (int i = s.length() - 1; i >= 0; i--) {
        result += s.charAt(i);
    }
    return result;
}',
'[{"input": "hello", "expected": "olleh", "description": "Reverse hello"}, {"input": "Java", "expected": "avaJ", "description": "Reverse Java"}]',
ARRAY['Use a loop starting from the end', 'charAt(i) gets the character at index i'],
ARRAY['String Methods', 'Loops'],
10),

('11111111-1111-1111-1111-111111111202', 'csa-2-18', 'Sum Array', 'Write a method that calculates the sum of all elements in an integer array.', 'easy', 'write_method',
'public static int sumArray(int[] arr) {
    // Return the sum of all elements

}',
'public static int sumArray(int[] arr) {
    int sum = 0;
    for (int i = 0; i < arr.length; i++) {
        sum += arr[i];
    }
    return sum;
}',
'[{"input": "[1, 2, 3, 4, 5]", "expected": "15", "description": "Sum of 1+2+3+4+5"}, {"input": "[10, -5, 3]", "expected": "8", "description": "Sum with negative"}]',
ARRAY['Initialize a sum variable to 0', 'Loop through each element'],
ARRAY['For Loops', 'Arrays'],
5),

('11111111-1111-1111-1111-111111111203', 'csa-2-17', 'Count Digits', 'Count how many digits are in a positive integer using a while loop.', 'medium', 'write_method',
'public static int countDigits(int n) {
    // Return the number of digits in n
    // Example: 12345 has 5 digits

}',
'public static int countDigits(int n) {
    int count = 0;
    while (n > 0) {
        count++;
        n = n / 10;
    }
    return count;
}',
'[{"input": "12345", "expected": "5", "description": "12345 has 5 digits"}, {"input": "100", "expected": "3", "description": "100 has 3 digits"}]',
ARRAY['Dividing by 10 removes the last digit', 'Keep counting until n becomes 0'],
ARRAY['While Loops', 'Integer Division'],
8),

-- Unit 3: Classes, Arrays, ArrayList
('11111111-1111-1111-1111-111111111301', 'csa-3-11', 'Find Maximum', 'Find the maximum value in an integer array.', 'easy', 'write_method',
'public static int findMax(int[] arr) {
    // Return the maximum value in the array

}',
'public static int findMax(int[] arr) {
    int max = arr[0];
    for (int i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }
    return max;
}',
'[{"input": "[3, 7, 2, 9, 1]", "expected": "9", "description": "Max is 9"}, {"input": "[-5, -2, -8]", "expected": "-2", "description": "Max of negatives"}]',
ARRAY['Start with the first element as max', 'Compare each element and update max if larger'],
ARRAY['Arrays', 'Loops', 'Conditionals'],
5),

('11111111-1111-1111-1111-111111111302', 'csa-3-15', 'Remove Duplicates', 'Remove duplicate strings from an ArrayList.', 'medium', 'write_method',
'public static ArrayList<String> removeDuplicates(ArrayList<String> list) {
    // Return a new ArrayList with duplicates removed

}',
'public static ArrayList<String> removeDuplicates(ArrayList<String> list) {
    ArrayList<String> result = new ArrayList<>();
    for (String s : list) {
        if (!result.contains(s)) {
            result.add(s);
        }
    }
    return result;
}',
'[{"input": "[\"a\", \"b\", \"a\", \"c\", \"b\"]", "expected": "[\"a\", \"b\", \"c\"]", "description": "Remove duplicates"}]',
ARRAY['Create a new ArrayList for results', 'Only add if not already present'],
ARRAY['ArrayList', 'contains method'],
10),

-- Unit 4: 2D Arrays, Inheritance, Recursion
('11111111-1111-1111-1111-111111111401', 'csa-4-1', 'Row Sum', 'Calculate the sum of a specific row in a 2D array.', 'medium', 'write_method',
'public static int rowSum(int[][] arr, int row) {
    // Return the sum of elements in the specified row

}',
'public static int rowSum(int[][] arr, int row) {
    int sum = 0;
    for (int col = 0; col < arr[row].length; col++) {
        sum += arr[row][col];
    }
    return sum;
}',
'[{"input": "[[1,2,3],[4,5,6]], row=1", "expected": "15", "description": "Sum of row 1"}]',
ARRAY['Access elements with arr[row][col]', 'Loop through columns of that row'],
ARRAY['2D Arrays', 'Nested Loops'],
8),

('11111111-1111-1111-1111-111111111402', 'csa-4-10', 'Factorial Recursive', 'Write a recursive method to calculate factorial.', 'medium', 'write_method',
'public static int factorial(int n) {
    // Return n! using recursion
    // Base case: 0! = 1

}',
'public static int factorial(int n) {
    if (n == 0) {
        return 1;
    }
    return n * factorial(n - 1);
}',
'[{"input": "5", "expected": "120", "description": "5! = 120"}, {"input": "0", "expected": "1", "description": "0! = 1"}]',
ARRAY['What is the base case?', 'n! = n * (n-1)!'],
ARRAY['Recursion', 'Base Case'],
10),

('11111111-1111-1111-1111-111111111403', 'csa-4-10', 'Fibonacci Recursive', 'Write a recursive method to calculate the nth Fibonacci number.', 'hard', 'write_method',
'public static int fibonacci(int n) {
    // Return the nth Fibonacci number
    // F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2)

}',
'public static int fibonacci(int n) {
    if (n <= 1) {
        return n;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
}',
'[{"input": "6", "expected": "8", "description": "F(6) = 8"}, {"input": "10", "expected": "55", "description": "F(10) = 55"}]',
ARRAY['Two base cases: F(0) and F(1)', 'Each call makes two recursive calls'],
ARRAY['Recursion', 'Multiple Recursive Calls'],
12)

ON CONFLICT DO NOTHING;

-- ============================================
-- Helper function to delete user account
-- ============================================

CREATE OR REPLACE FUNCTION delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete from all course-related tables
  DELETE FROM study_sessions WHERE user_id = auth.uid();
  DELETE FROM user_milestones WHERE user_id = auth.uid();
  DELETE FROM code_challenge_progress WHERE user_id = auth.uid();
  DELETE FROM topic_progress WHERE user_id = auth.uid();
  DELETE FROM assessment_results WHERE user_id = auth.uid();
  DELETE FROM course_onboarding WHERE user_id = auth.uid();

  -- Delete from other app tables (if they exist)
  DELETE FROM user_progress WHERE user_id = auth.uid();
  DELETE FROM profiles WHERE id = auth.uid();

  -- Note: The auth.users deletion should be handled by Supabase Auth
END;
$$;
