// Study Tools TypeScript Types

// =====================================================
// FLASHCARD TYPES (existing tables)
// =====================================================

export interface FlashcardSet {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  subject_id?: string;
  is_public: boolean;
  card_count: number;
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: string;
  set_id: string;
  front: string;
  back: string;
  position: number;
  image_url?: string;
  times_reviewed: number;
  times_correct: number;
  last_reviewed?: string;
  created_at: string;
}

// =====================================================
// STUDY GUIDE TYPES
// =====================================================

export interface StudyGuideSection {
  title: string;
  content: string;
  subsections?: {
    title: string;
    content: string;
  }[];
}

export interface StudyGuideOutline {
  sections: StudyGuideSection[];
}

export interface KeyTerm {
  term: string;
  definition: string;
}

export interface CauseEffect {
  cause: string;
  effect: string;
}

export interface QuickReference {
  keyTerms: KeyTerm[];
  factsToMemorize: string[];
  causeEffect: CauseEffect[];
}

export interface StudyGuide {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  source_text?: string;
  source_type: 'text' | 'file';
  outline_content: StudyGuideOutline;
  quick_reference: QuickReference;
  ap_class: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// PRACTICE TEST TYPES
// =====================================================

export interface MCQChoice {
  index: number;
  text: string;
}

export interface FRQRubricItem {
  criterion: string;
  points: number;
}

export interface PracticeTestQuestion {
  id: string;
  type: 'mcq' | 'frq';
  question: string;
  // MCQ specific
  choices?: MCQChoice[];
  correctAnswerIndex?: number;
  // FRQ specific
  rubric?: FRQRubricItem[];
  sampleAnswer?: string;
  // Common
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  relatedTopic?: string;
}

export interface PracticeTestSettings {
  questionCount: number;
  timerMinutes: number | null;
  questionTypes: ('mcq' | 'frq')[];
}

export interface PracticeTest {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  settings: PracticeTestSettings;
  source_set_ids: string[];
  source_guide_ids: string[];
  questions: PracticeTestQuestion[];
  ap_class: string;
  created_at: string;
  updated_at: string;
}

export interface PracticeTestAnswer {
  questionIndex: number;
  answer: string | number; // string for FRQ, number (choice index) for MCQ
  isCorrect?: boolean;
  pointsEarned?: number;
}

export interface PracticeTestAttempt {
  id: string;
  user_id: string;
  test_id: string;
  answers: PracticeTestAnswer[];
  score: number;
  max_score: number;
  time_taken_seconds?: number;
  completed_at?: string;
  created_at: string;
}

// =====================================================
// FOLDER TYPES
// =====================================================

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export type FolderItemType = 'flashcard_set' | 'study_guide' | 'practice_test';

export interface FolderItem {
  id: string;
  folder_id: string;
  item_type: FolderItemType;
  item_id: string;
  added_at: string;
}

// =====================================================
// API REQUEST/RESPONSE TYPES
// =====================================================

export interface GenerateFlashcardsRequest {
  text: string;
  count?: number;
  existingTerms?: string[];
}

export interface GenerateFlashcardsResponse {
  flashcards: {
    front: string;
    back: string;
  }[];
}

export interface GenerateStudyGuideRequest {
  text: string;
}

export interface GenerateStudyGuideResponse {
  title: string;
  outline: StudyGuideOutline;
  quickReference: QuickReference;
}

export interface GeneratePracticeTestRequest {
  sourceContent: {
    flashcardSets: {
      id: string;
      cards: { front: string; back: string }[];
    }[];
    studyGuides: {
      id: string;
      outline: StudyGuideOutline;
      quickReference: QuickReference;
    }[];
  };
  settings: PracticeTestSettings;
}

export interface GeneratePracticeTestResponse {
  title: string;
  questions: PracticeTestQuestion[];
}

// =====================================================
// CREATE MENU TYPES
// =====================================================

export type CreateMenuOption =
  | 'flashcard_set'
  | 'study_guide'
  | 'practice_test'
  | 'folder'
  | 'study_group';
