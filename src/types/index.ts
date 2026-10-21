export type CognitiveLevel = 'NhanBiet' | 'ThongHieu' | 'VanDung';

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface ExerciseItem {
  id: string;
  grade: number; // 1 to 5
  level: CognitiveLevel;
  topic: string; // e.g. "Unit 1: In the school playground"
  unit?: string; // e.g. "Unit 1"
  unitNumber?: number; // e.g. 1
  word: string; // Target English phrase/sentence
  phonetic?: string; // IPA transcription
  meaning: string; // Vietnamese translation
  emoji: string; // Mascot or illustration emoji
  dialoguePartner?: string; // Prompt for Q&A or dialogue (e.g. "What's your name?")
  vietnameseHint?: string; // Phonetic tip for Vietnamese elementary students
  audioModelUrl?: string; // Base64 or Blob URL for recorded teacher audio
  difficulty?: 'Easy' | 'Medium' | 'Challenge';
  points?: number;
}

export interface StudentProfile {
  code: string; // e.g. "H901"
  name: string; // e.g. "Bé Minh Khang"
  grade: number;
  stars: number;
  streakDays: number;
  spinTickets: number;
  completedIds: Record<string, { score: number; date: string }>;
  avatar: string;
}

export interface PronunciationResult {
  spokenText: string;
  targetText: string;
  similarityScore: number; // 0 to 100
  passed: boolean;
  wordEvaluations: {
    word: string;
    matched: boolean;
    accuracy: number;
  }[];
  feedbackMessage: string;
  tips: string;
  earnedStars: number;
}

export type TeacherSubject =
  | 'Math'
  | 'Science'
  | 'ICT'
  | 'Art'
  | 'Music'
  | 'PE'
  | 'SocialStudies'
  | 'ClassroomGeneral';

export type CefrLevel = 'A1' | 'A2' | 'B1';

export type CommandCategory =
  | 'Opening'
  | 'Instruction'
  | 'GroupWork'
  | 'Discipline'
  | 'Encouragement'
  | 'WrapUp'
  | 'SubjectSpecific';

export interface ClassroomCommandItem {
  id: string;
  category: CommandCategory;
  categoryVi: string;
  commandEn: string;
  phonetic: string;
  meaningVi: string;
  situation: string;
  subject?: TeacherSubject;
  level: CefrLevel;
  icon?: string;
}

export interface UnitKnowledgeOverview {
  subject: TeacherSubject;
  subjectNameVi: string;
  cefrLevel: CefrLevel;
  unitTheme: string;
  lessonObjectives: string[];
  coreConcepts: {
    conceptEn: string;
    conceptVi: string;
    explanation: string;
  }[];
  keyVocabulary: {
    term: string;
    phonetic: string;
    meaning: string;
    exampleSentence: string;
  }[];
  standardStructures: {
    patternEn: string;
    meaningVi: string;
    usageTip: string;
  }[];
  essentialCommands: {
    commandEn: string;
    meaningVi: string;
  }[];
  pedagogicalTips: string[];
}

export interface TeacherLessonItem {
  id: string;
  subject: TeacherSubject;
  subjectNameVi: string;
  cefrLevel: CefrLevel;
  scenario: string; // Tình huống sư phạm
  englishPrompt: string; // Câu tiếng Anh giáo viên nói
  phonetic?: string;
  vietnameseMeaning: string;
  teachingContext: string;
  keyTerms: string[];
  studentReaction?: string;
  pedagogicalNote?: string;
  emoji: string;
}
