import type { CurriculumSession } from './curriculum';

export type StudentStatus = '재원' | '휴원' | '퇴원';

export interface ParentContact {
  id: string;
  relation: string;
  name: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
  /** 학부모가 초대를 수락해 로그인 계정을 만들면 그 계정의 auth id가 들어옴 */
  userId?: string;
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

export const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const CLASS_LOCATIONS = ['오프라인', '온라인'] as const;
export type ClassLocation = (typeof CLASS_LOCATIONS)[number];

export interface SchoolClass {
  id: string;
  name: string;
  gradeBand?: string;
  daysOfWeek: Weekday[];
  time?: string;
  location: ClassLocation;
  mainTextbookId?: string;
  sessions: CurriculumSession[];
}
