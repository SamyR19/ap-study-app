// Type definitions for AP Study App

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Question {
  id: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_text: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
  created_at: string;
}

export interface CodeSubmission {
  id: string;
  user_id: string;
  language_id: number;
  source_code: string;
  stdin?: string;
  expected_output?: string;
  status: string;
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  created_at: string;
}

export interface StudyProgress {
  id: string;
  user_id: string;
  subject: string;
  topic: string;
  questions_attempted: number;
  questions_correct: number;
  last_studied: string;
}

// Judge0 API Types
export interface Judge0Submission {
  language_id: number;
  source_code: string;
  stdin?: string;
  expected_output?: string;
}

export interface Judge0Result {
  token: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string;
  memory: number;
}
