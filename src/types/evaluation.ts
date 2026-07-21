export const SUBJECTS = ['듣기', '읽기', '말하기', '쓰기', '생각하기'] as const;
export type Subject = (typeof SUBJECTS)[number];

export type RatedSubject = Exclude<Subject, '쓰기'>;

export const RATING_LEVELS = ['상', '중', '하'] as const;
export type RatingLevel = (typeof RATING_LEVELS)[number];

export interface DomainDefinition {
  id: string;
  label: string;
  weight: number;
  description: string;
  criteria: string[];
}

export interface RatingResult {
  domainId: string;
  rating: RatingLevel;
}

export interface ParagraphFeedback {
  id: string;
  paragraphIndex: number;
  comment: string;
}

export interface WritingDomainScore {
  domainId: string;
  score: number;
}

export interface WritingEvaluation {
  imageDataUrl?: string;
  overallComment: string;
  paragraphFeedback: ParagraphFeedback[];
  domainScores: WritingDomainScore[];
  aiAnalyzed: boolean;
}

export interface Evaluation {
  id: string;
  studentId: string;
  date: string;
  listening: RatingResult[];
  reading: RatingResult[];
  speaking: RatingResult[];
  thinking: RatingResult[];
  writing: WritingEvaluation;
  createdAt: string;
  updatedAt: string;
}

export type EvaluationInput = Pick<Evaluation, 'date' | 'listening' | 'reading' | 'speaking' | 'thinking' | 'writing'>;
