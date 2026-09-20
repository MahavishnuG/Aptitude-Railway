export type RRBExamType = 'NTPC' | 'Group D' | 'ALP' | 'JE';

export type QuantTopic =
  | 'Number System & Divisibility Rules'
  | 'BODMAS, Simplification, Fractions & Decimals'
  | 'LCM & HCF'
  | 'Ratio, Proportion & Partnership'
  | 'Percentages & Population Logic'
  | 'Profit, Loss & Successive Discounts'
  | 'Simple Interest & Compound Interest'
  | 'Time & Work'
  | 'Pipes & Cisterns'
  | 'Speed, Time & Distance'
  | 'Boats & Streams'
  | 'Alligation & Mixtures'
  | 'Problems on Ages & Averages'
  | 'Mensuration 2D & 3D'
  | 'Elementary Algebra, Geometry & Trigonometry';

export type ReasoningTopic =
  | 'Syllogism'
  | 'Coding-Decoding & Alphanumeric Series'
  | 'Blood Relations & Coded Family Trees'
  | 'Direction Sense & Distance Calculations'
  | 'Seating Arrangement'
  | 'Analogies & Odd One Out'
  | 'Mathematical Operations & Symbol Swapping'
  | 'Venn Diagrams & Logical Set Inclusion'
  | 'Statement, Arguments & Assumptions'
  | 'Statement & Conclusions / Decision Making'
  | 'Clock & Calendar'
  | 'Data Interpretation'
  | 'Non-Verbal Reasoning & Pattern Completion';

export type QuestionTopic = QuantTopic | ReasoningTopic;

export interface SocraticHints {
  level1: {
    title: string;
    titleTa: string;
    formula: string;
    concept: string;
    conceptTa: string;
  };
  level2: {
    title: string;
    titleTa: string;
    variables: string;
    calculationClue: string;
    calculationClueTa: string;
  };
  level3Tanglish: {
    title: string;
    stepByStep: string;
    speechText: string;
  };
}

export interface Question {
  id: string;
  topic: QuestionTopic;
  rrbExam: RRBExamType;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isSpeedTrickCard?: boolean;
  questionEn: string;
  questionTa: string;
  optionsEn: string[];
  optionsTa: string[];
  correctIndex: number; // 0, 1, 2, or 3 (strictly randomized)
  speedTrickEn: string;
  speedTrickTa: string;
  hints: SocraticHints;
  explanationEn: string;
  explanationTa: string;
  isAiGenerated?: boolean;
  sourceExamYear?: string;
}

export interface Badge {
  id: string;
  title: string;
  titleTa: string;
  description: string;
  descriptionTa: string;
  icon: string;
  requiredSolved: number;
}

export type MockTestType = 'mini' | 'mastery' | 'full';

export interface MockTestConfig {
  type: MockTestType;
  title: string;
  titleTa: string;
  description: string;
  questionCount: number;
  durationMinutes: number;
  badge: string;
}

export interface MockTestResult {
  id: string;
  date: string;
  testType: MockTestType;
  testTitle: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  wrong: number;
  unattempted: number;
  score: number; // +1 for correct, -0.33 for wrong
  accuracy: number;
  timeSpentSeconds: number;
  weakTopics: string[];
  strongTopics: string[];
  speedPerQuestionAvgSeconds: number;
  wrongQuestions?: Array<{ question: Question; userChoice: number }>;
}

export type NavigationTab = 'dashboard' | 'topics' | 'reels' | 'mock' | 'history' | 'profile';

export interface UserProfile {
  userId: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  streakCount: number;
  lastActiveDate: string;
  lastDailyChallengeDate?: string;
  points: number;
  completedQuestions: string[];
  dailyFuel: number; // questions solved today
  dailyGoal: number; // target questions per day (default 20)
  targetExam: RRBExamType;
  mockScores: MockTestResult[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FormulaMatchItem {
  id: string;
  concept: string;
  conceptTa: string;
  formula: string;
  topic: string;
}
