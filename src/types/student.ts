import type { CurriculumSession } from './curriculum';

export type StudentStatus = '재원' | '휴원' | '퇴원';

export interface ParentContact {
  id: string;
  relation: string;
  name: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
}

export interface ReadingRecord {
  id: string;
  date: string;
  title: string;
  author: string;
  memo: string;
}

export interface FeedbackRecord {
  id: string;
  date: string;
  title: string;
  content: string;
  score?: string;
}

export type AttendanceStatus = '출석' | '지각' | '결석' | '조퇴';

export interface AttendanceRecord {
  id: string;
  date: string;
  status: AttendanceStatus;
  memo?: string;
}

export interface ConsultationRecord {
  id: string;
  date: string;
  type: string;
  content: string;
  nextConsultationDate?: string;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  school: string;
  classId: string;
  status: StudentStatus;
  phone?: string;
  parentContacts: ParentContact[];
  note?: string;
  readingHistory: ReadingRecord[];
  feedbackHistory: FeedbackRecord[];
  attendanceHistory: AttendanceRecord[];
  consultationHistory: ConsultationRecord[];
  createdAt: string;
  updatedAt: string;
}

export type StudentInput = Pick<
  Student,
  'name' | 'grade' | 'school' | 'classId' | 'status' | 'phone' | 'parentContacts' | 'note'
>;

export interface SchoolClass {
  id: string;
  name: string;
  gradeBand?: string;
  schedule?: string;
  mainTextbookId?: string;
  sessions: CurriculumSession[];
}
