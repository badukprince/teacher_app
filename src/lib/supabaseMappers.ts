import { supabase } from './supabaseClient';
import type {
  AttendanceRecord,
  AttendanceStatus,
  ClassLocation,
  ConsultationRecord,
  FeedbackRecord,
  ParentContact,
  ReadingRecord,
  SchoolClass,
  Student,
  StudentStatus,
  Weekday,
} from '../types/student';
import type { CurriculumSession, Textbook } from '../types/curriculum';
import type { Evaluation, RatingResult, WritingEvaluation } from '../types/evaluation';
import type { NotificationLog, NotificationType, SendChannel } from '../types/communication';

interface ClassRow {
  id: string;
  name: string;
  grade_band: string | null;
  days_of_week: string[];
  time: string | null;
  location: string;
  main_textbook_id: string | null;
}

interface TextbookRow {
  id: string;
  title: string;
  author: string | null;
  publisher: string | null;
  grades: string[];
  stage: string | null;
  description: string | null;
}

interface CurriculumSessionRow {
  id: string;
  class_id: string;
  date: string | null;
  topic: string;
  textbook_id: string | null;
  summary: string | null;
  completed: boolean;
  position: number;
}

interface StudentRow {
  id: string;
  name: string;
  grade: string;
  school: string;
  class_id: string | null;
  status: string;
  phone: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

interface ParentContactRow {
  id: string;
  student_id: string;
  relation: string;
  name: string;
  phone: string;
  email: string | null;
  is_primary: boolean;
}

interface ReadingRecordRow {
  id: string;
  student_id: string;
  date: string;
  title: string;
  author: string | null;
  memo: string | null;
}

interface FeedbackRecordRow {
  id: string;
  student_id: string;
  date: string;
  title: string;
  content: string | null;
  score: string | null;
}

interface AttendanceRecordRow {
  id: string;
  student_id: string;
  date: string;
  status: string;
  memo: string | null;
}

interface ConsultationRecordRow {
  id: string;
  student_id: string;
  date: string;
  type: string | null;
  content: string | null;
  next_consultation_date: string | null;
}

interface EvaluationRow {
  id: string;
  student_id: string;
  date: string;
  listening: RatingResult[];
  reading: RatingResult[];
  speaking: RatingResult[];
  thinking: RatingResult[];
  writing: WritingEvaluation;
  created_at: string;
  updated_at: string;
}

interface NotificationLogRow {
  id: string;
  student_id: string;
  type: string;
  channel: string;
  subject: string | null;
  body: string | null;
  sent_at: string;
  answered: boolean;
}

export interface FetchedData {
  students: Student[];
  classes: SchoolClass[];
  textbooks: Textbook[];
  evaluations: Evaluation[];
  notifications: NotificationLog[];
}

function groupBy<T, K extends string>(rows: T[], key: (row: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const row of rows) {
    const k = key(row);
    const list = map.get(k);
    if (list) list.push(row);
    else map.set(k, [row]);
  }
  return map;
}

export async function fetchAllData(teacherId: string): Promise<FetchedData> {
  const [
    classesRes,
    textbooksRes,
    sessionsRes,
    studentsRes,
    parentContactsRes,
    readingRes,
    feedbackRes,
    attendanceRes,
    consultationRes,
    evaluationsRes,
    notificationsRes,
  ] = await Promise.all([
    supabase.from('classes').select('*').eq('teacher_id', teacherId),
    supabase.from('textbooks').select('*').eq('teacher_id', teacherId),
    supabase.from('curriculum_sessions').select('*').eq('teacher_id', teacherId).order('position'),
    supabase.from('students').select('*').eq('teacher_id', teacherId),
    supabase.from('parent_contacts').select('*').eq('teacher_id', teacherId),
    supabase.from('reading_records').select('*').eq('teacher_id', teacherId),
    supabase.from('feedback_records').select('*').eq('teacher_id', teacherId),
    supabase.from('attendance_records').select('*').eq('teacher_id', teacherId),
    supabase.from('consultation_records').select('*').eq('teacher_id', teacherId),
    supabase.from('evaluations').select('*').eq('teacher_id', teacherId),
    supabase.from('notification_logs').select('*').eq('teacher_id', teacherId),
  ]);

  for (const res of [
    classesRes,
    textbooksRes,
    sessionsRes,
    studentsRes,
    parentContactsRes,
    readingRes,
    feedbackRes,
    attendanceRes,
    consultationRes,
    evaluationsRes,
    notificationsRes,
  ]) {
    if (res.error) throw res.error;
  }

  const sessionsByClass = groupBy(sessionsRes.data as CurriculumSessionRow[], (r) => r.class_id);
  const contactsByStudent = groupBy(parentContactsRes.data as ParentContactRow[], (r) => r.student_id);
  const readingByStudent = groupBy(readingRes.data as ReadingRecordRow[], (r) => r.student_id);
  const feedbackByStudent = groupBy(feedbackRes.data as FeedbackRecordRow[], (r) => r.student_id);
  const attendanceByStudent = groupBy(attendanceRes.data as AttendanceRecordRow[], (r) => r.student_id);
  const consultationByStudent = groupBy(consultationRes.data as ConsultationRecordRow[], (r) => r.student_id);

  const classes: SchoolClass[] = (classesRes.data as ClassRow[]).map((c) => ({
    id: c.id,
    name: c.name,
    gradeBand: c.grade_band ?? undefined,
    daysOfWeek: c.days_of_week as Weekday[],
    time: c.time ?? undefined,
    location: c.location as ClassLocation,
    mainTextbookId: c.main_textbook_id ?? undefined,
    sessions: (sessionsByClass.get(c.id) ?? []).map(
      (s): CurriculumSession => ({
        id: s.id,
        date: s.date ?? undefined,
        topic: s.topic,
        textbookId: s.textbook_id ?? undefined,
        summary: s.summary ?? '',
        completed: s.completed,
      }),
    ),
  }));

  const textbooks: Textbook[] = (textbooksRes.data as TextbookRow[]).map((t) => ({
    id: t.id,
    title: t.title,
    author: t.author ?? undefined,
    publisher: t.publisher ?? undefined,
    grades: t.grades,
    stage: t.stage ?? undefined,
    description: t.description ?? undefined,
  }));

  const students: Student[] = (studentsRes.data as StudentRow[]).map((s) => ({
    id: s.id,
    name: s.name,
    grade: s.grade,
    school: s.school,
    classId: s.class_id ?? '',
    status: s.status as StudentStatus,
    phone: s.phone ?? undefined,
    note: s.note ?? undefined,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
    parentContacts: (contactsByStudent.get(s.id) ?? []).map(
      (c): ParentContact => ({
        id: c.id,
        relation: c.relation,
        name: c.name,
        phone: c.phone,
        email: c.email ?? undefined,
        isPrimary: c.is_primary,
      }),
    ),
    readingHistory: (readingByStudent.get(s.id) ?? []).map(
      (r): ReadingRecord => ({ id: r.id, date: r.date, title: r.title, author: r.author ?? '', memo: r.memo ?? '' }),
    ),
    feedbackHistory: (feedbackByStudent.get(s.id) ?? []).map(
      (r): FeedbackRecord => ({
        id: r.id,
        date: r.date,
        title: r.title,
        content: r.content ?? '',
        score: r.score ?? undefined,
      }),
    ),
    attendanceHistory: (attendanceByStudent.get(s.id) ?? []).map(
      (r): AttendanceRecord => ({
        id: r.id,
        date: r.date,
        status: r.status as AttendanceStatus,
        memo: r.memo ?? undefined,
      }),
    ),
    consultationHistory: (consultationByStudent.get(s.id) ?? []).map(
      (r): ConsultationRecord => ({
        id: r.id,
        date: r.date,
        type: r.type ?? '',
        content: r.content ?? '',
        nextConsultationDate: r.next_consultation_date ?? undefined,
      }),
    ),
  }));

  const evaluations: Evaluation[] = (evaluationsRes.data as EvaluationRow[]).map((e) => ({
    id: e.id,
    studentId: e.student_id,
    date: e.date,
    listening: e.listening,
    reading: e.reading,
    speaking: e.speaking,
    thinking: e.thinking,
    writing: e.writing,
    createdAt: e.created_at,
    updatedAt: e.updated_at,
  }));

  const notifications: NotificationLog[] = (notificationsRes.data as NotificationLogRow[]).map((n) => ({
    id: n.id,
    studentId: n.student_id,
    type: n.type as NotificationType,
    channel: n.channel as SendChannel,
    subject: n.subject ?? '',
    body: n.body ?? '',
    sentAt: n.sent_at,
    answered: n.answered,
  }));

  return { students, classes, textbooks, evaluations, notifications };
}
