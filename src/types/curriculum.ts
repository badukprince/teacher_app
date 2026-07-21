export interface Textbook {
  id: string;
  title: string;
  author?: string;
  publisher?: string;
  grades: string[];
  stage?: string;
  description?: string;
}

export interface CurriculumSession {
  id: string;
  date?: string;
  topic: string;
  textbookId?: string;
  summary: string;
  completed: boolean;
}

export type TextbookInput = Pick<Textbook, 'title' | 'author' | 'publisher' | 'grades' | 'stage' | 'description'>;
export type SessionInput = Pick<CurriculumSession, 'date' | 'topic' | 'textbookId' | 'summary'>;
