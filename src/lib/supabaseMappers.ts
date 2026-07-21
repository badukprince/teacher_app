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
  user_id: string | null;
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

// ---- row -> app-type mappers (pure, reused by both the teacher and parent fetchers) ----

function mapCurriculumSession(s: CurriculumSessionRow): CurriculumSession {
  return {
    id: s.id,
    date: s.date ?? undefined,
    topic: s.topic,
    textbookId: s.textbook_id ?? undefined,
    summary: s.summary ?? '',
    completed: s.completed,
  };
}

function mapClass(c: ClassRow, sessions: CurriculumSession[]): SchoolClass {
  return {
    id: c.id,
    name: c.name,
    gradeBand: c.grade_band ?? undefined,
    daysOfWeek: c.days_of_week as Weekday[],
    time: c.time ?? undefined,
    location: c.location as ClassLocation,
    mainTextbookId: c.main_textbook_id ?? undefined,
    sessions,
  };
}

function mapTextbook(t: TextbookRow): Textbook {
  return {
    id: t.id,
    title: t.title,
    author: t.author ?? undefined,
    publisher: t.publisher ?? undefined,
    grades: t.grades,
    stage: t.stage ?? undefined,
    description: t.description ?? undefined,
  };
}

function mapParentContact(c: ParentContactRow): ParentContact {
  return {
    id: c.id,
    relation: c.relation,
    name: c.name,
    phone: c.phone,
    email: c.email ?? undefined,
    isPrimary: c.is_primary,
    userId: c.user_id ?? undefined,
  };
}

function mapReadingRecord(r: ReadingRecordRow): ReadingRecord {
  return { id: r.id, date: r.date, title: r.title, author: r.author ?? '', memo: r.memo ?? '' };
}

function mapFeedbackRecord(r: FeedbackRecordRow): FeedbackRecord {
  return { id: r.id, date: r.date, title: r.title, content: r.content ?? '', score: r.score ?? undefined };
}

function mapAttendanceRecord(r: AttendanceRecordRow): AttendanceRecord {
  return { id: r.id, date: r.date, status: r.status as AttendanceStatus, memo: r.memo ?? undefined };
}

function mapConsultationRecord(r: ConsultationRecordRow): ConsultationRecord {
  return {
    id: r.id,
    date: r.date,
    type: r.type ?? '',
    content: r.content ?? '',
    nextConsultationDate: r.next_consultation_date ?? undefined,
  };
}

function mapEvaluation(e: EvaluationRow): Evaluation {
  return {
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
  };
}

function mapNotificationLog(n: NotificationLogRow): NotificationLog {
  return {
    id: n.id,
    studentId: n.student_id,
    type: n.type as NotificationType,
    channel: n.channel as SendChannel,
    subject: n.subject ?? '',
    body: n.body ?? '',
    sentAt: n.sent_at,
    answered: n.answered,
  };
}

interface StudentChildren {
  parentContacts: ParentContact[];
  readingHistory: ReadingRecord[];
  feedbackHistory: FeedbackRecord[];
  attendanceHistory: AttendanceRecord[];
  consultationHistory: ConsultationRecord[];
}

function mapStudent(s: StudentRow, children: StudentChildren): Student {
  return {
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
    ...children,
  };
}

// ---- teacher: fetch everything they own ----

export interface FetchedData {
  students: Student[];
  classes: SchoolClass[];
  textbooks: Textbook[];
  evaluations: Evaluation[];
  notifications: NotificationLog[];
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

  const classes: SchoolClass[] = (classesRes.data as ClassRow[]).map((c) =>
    mapClass(c, (sessionsByClass.get(c.id) ?? []).map(mapCurriculumSession)),
  );

  const textbooks: Textbook[] = (textbooksRes.data as TextbookRow[]).map(mapTextbook);

  const students: Student[] = (studentsRes.data as StudentRow[]).map((s) =>
    mapStudent(s, {
      parentContacts: (contactsByStudent.get(s.id) ?? []).map(mapParentContact),
      readingHistory: (readingByStudent.get(s.id) ?? []).map(mapReadingRecord),
      feedbackHistory: (feedbackByStudent.get(s.id) ?? []).map(mapFeedbackRecord),
      attendanceHistory: (attendanceByStudent.get(s.id) ?? []).map(mapAttendanceRecord),
      consultationHistory: (consultationByStudent.get(s.id) ?? []).map(mapConsultationRecord),
    }),
  );

  const evaluations: Evaluation[] = (evaluationsRes.data as EvaluationRow[]).map(mapEvaluation);
  const notifications: NotificationLog[] = (notificationsRes.data as NotificationLogRow[]).map(mapNotificationLog);

  return { students, classes, textbooks, evaluations, notifications };
}

// ---- parent: fetch just their one linked student's data ----

export interface ParentFetchedData {
  student: Student;
  schoolClass: SchoolClass | null;
  evaluations: Evaluation[];
  textbooks: Textbook[];
}

export async function fetchParentStudentData(): Promise<ParentFetchedData | null> {
  // RLS scopes this to exactly the student(s) linked to the signed-in parent's user_id.
  const studentsRes = await supabase.from('students').select('*');
  if (studentsRes.error) throw studentsRes.error;
  const studentRow = (studentsRes.data as StudentRow[])[0];
  if (!studentRow) return null;

  const [classRes, sessionsRes, readingRes, feedbackRes, attendanceRes, evaluationsRes, textbooksRes] = await Promise.all([
    studentRow.class_id
      ? supabase.from('classes').select('*').eq('id', studentRow.class_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    studentRow.class_id
      ? supabase.from('curriculum_sessions').select('*').eq('class_id', studentRow.class_id).order('position')
      : Promise.resolve({ data: [], error: null }),
    supabase.from('reading_records').select('*').eq('student_id', studentRow.id),
    supabase.from('feedback_records').select('*').eq('student_id', studentRow.id),
    supabase.from('attendance_records').select('*').eq('student_id', studentRow.id),
    supabase.from('evaluations').select('*').eq('student_id', studentRow.id),
    // textbooks aren't personal data — RLS lets any authenticated user (including parents) read them all
    supabase.from('textbooks').select('*'),
  ]);

  for (const res of [classRes, sessionsRes, readingRes, feedbackRes, attendanceRes, evaluationsRes, textbooksRes]) {
    if (res.error) throw res.error;
  }

  const sessions = ((sessionsRes.data as CurriculumSessionRow[]) ?? []).map(mapCurriculumSession);
  const classRow = classRes.data as ClassRow | null;
  const schoolClass = classRow ? mapClass(classRow, sessions) : null;

  const student = mapStudent(studentRow, {
    parentContacts: [],
    readingHistory: (readingRes.data as ReadingRecordRow[]).map(mapReadingRecord),
    feedbackHistory: (feedbackRes.data as FeedbackRecordRow[]).map(mapFeedbackRecord),
    attendanceHistory: (attendanceRes.data as AttendanceRecordRow[]).map(mapAttendanceRecord),
    consultationHistory: [],
  });

  const evaluations = (evaluationsRes.data as EvaluationRow[]).map(mapEvaluation);
  const textbooks = (textbooksRes.data as TextbookRow[]).map(mapTextbook);

  return { student, schoolClass, evaluations, textbooks };
}
