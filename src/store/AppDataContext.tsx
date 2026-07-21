import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type {
  AttendanceRecord,
  AttendanceStatus,
  ConsultationRecord,
  FeedbackRecord,
  ReadingRecord,
  SchoolClass,
  Student,
  StudentInput,
} from '../types/student';
import type { CurriculumSession, SessionInput, Textbook, TextbookInput } from '../types/curriculum';
import type { Evaluation, EvaluationInput } from '../types/evaluation';
import type { NotificationLog, NotificationLogInput } from '../types/communication';
import { newId } from '../lib/storage';
import { supabase } from '../lib/supabaseClient';
import { fetchAllData } from '../lib/supabaseMappers';
import { useAuth } from './AuthContext';

type ClassInput = Pick<SchoolClass, 'name' | 'gradeBand' | 'daysOfWeek' | 'time' | 'location' | 'mainTextbookId'>;

interface AppDataContextValue {
  students: Student[];
  classes: SchoolClass[];
  textbooks: Textbook[];
  evaluations: Evaluation[];
  notifications: NotificationLog[];
  getNotificationsForStudent: (studentId: string) => NotificationLog[];
  addNotificationLog: (input: NotificationLogInput) => NotificationLog;
  markNotificationAnswered: (id: string, answered: boolean) => void;
  getStudent: (id: string) => Student | undefined;
  getClass: (id: string) => SchoolClass | undefined;
  getTextbook: (id: string) => Textbook | undefined;
  getEvaluation: (id: string) => Evaluation | undefined;
  getEvaluationsForStudent: (studentId: string) => Evaluation[];
  addEvaluation: (studentId: string, input: EvaluationInput) => Evaluation;
  updateEvaluation: (id: string, input: EvaluationInput) => void;
  deleteEvaluation: (id: string) => void;
  addStudent: (input: StudentInput) => Student;
  updateStudent: (id: string, input: StudentInput) => void;
  deleteStudent: (id: string) => void;
  addClass: (input: ClassInput) => SchoolClass;
  updateClass: (id: string, input: ClassInput) => void;
  deleteClass: (id: string) => void;
  addTextbook: (input: TextbookInput) => Textbook;
  updateTextbook: (id: string, input: TextbookInput) => void;
  deleteTextbook: (id: string) => void;
  addSession: (classId: string, input: SessionInput) => void;
  updateSession: (classId: string, sessionId: string, input: SessionInput) => void;
  toggleSessionCompleted: (classId: string, sessionId: string) => void;
  removeSession: (classId: string, sessionId: string) => void;
  moveSession: (classId: string, sessionId: string, direction: 'up' | 'down') => void;
  addReadingRecord: (studentId: string, record: Omit<ReadingRecord, 'id'>) => void;
  removeReadingRecord: (studentId: string, recordId: string) => void;
  addFeedbackRecord: (studentId: string, record: Omit<FeedbackRecord, 'id'>) => void;
  removeFeedbackRecord: (studentId: string, recordId: string) => void;
  addAttendanceRecord: (studentId: string, record: Omit<AttendanceRecord, 'id'>) => void;
  removeAttendanceRecord: (studentId: string, recordId: string) => void;
  setAttendanceStatus: (studentId: string, date: string, status: AttendanceStatus) => void;
  addConsultationRecord: (studentId: string, record: Omit<ConsultationRecord, 'id'>) => void;
  removeConsultationRecord: (studentId: string, recordId: string) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const teacherId = session?.user.id;

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    if (!teacherId) return;
    let cancelled = false;
    setLoading(true);
    fetchAllData(teacherId)
      .then((data) => {
        if (cancelled) return;
        setStudents(data.students);
        setClasses(data.classes);
        setTextbooks(data.textbooks);
        setEvaluations(data.evaluations);
        setNotifications(data.notifications);
        setSyncError(null);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setSyncError('데이터를 불러오지 못했어요. 새로고침해주세요.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [teacherId]);

  const reportSyncFailure = useCallback(
    (err: unknown) => {
      console.error(err);
      setSyncError('저장에 실패했어요. 인터넷 연결을 확인해주세요.');
      if (teacherId) {
        fetchAllData(teacherId).then((data) => {
          setStudents(data.students);
          setClasses(data.classes);
          setTextbooks(data.textbooks);
          setEvaluations(data.evaluations);
          setNotifications(data.notifications);
        });
      }
    },
    [teacherId],
  );

  const value = useMemo<AppDataContextValue>(() => {
    const getStudent = (id: string) => students.find((s) => s.id === id);
    const getClass = (id: string) => classes.find((c) => c.id === id);
    const getTextbook = (id: string) => textbooks.find((t) => t.id === id);
    const getEvaluation = (id: string) => evaluations.find((e) => e.id === id);
    const getEvaluationsForStudent = (studentId: string) =>
      evaluations.filter((e) => e.studentId === studentId).sort((a, b) => a.date.localeCompare(b.date));

    const patchStudent = (id: string, patch: (s: Student) => Student) => {
      setStudents((prev) => prev.map((s) => (s.id === id ? patch(s) : s)));
    };

    const patchClass = (id: string, patch: (c: SchoolClass) => SchoolClass) => {
      setClasses((prev) => prev.map((c) => (c.id === id ? patch(c) : c)));
    };

    const addStudent = (input: StudentInput): Student => {
      const now = new Date().toISOString();
      const student: Student = {
        ...input,
        id: newId(),
        readingHistory: [],
        feedbackHistory: [],
        attendanceHistory: [],
        consultationHistory: [],
        createdAt: now,
        updatedAt: now,
      };
      setStudents((prev) => [...prev, student]);
      supabase
        .from('students')
        .insert({
          id: student.id,
          name: student.name,
          grade: student.grade,
          school: student.school,
          class_id: student.classId || null,
          status: student.status,
          phone: student.phone ?? null,
          note: student.note ?? null,
          created_at: now,
          updated_at: now,
        })
        .then(({ error }) => error && reportSyncFailure(error));
      return student;
    };

    const updateStudent = (id: string, input: StudentInput) => {
      const updatedAt = new Date().toISOString();
      patchStudent(id, (s) => ({ ...s, ...input, updatedAt }));
      supabase
        .from('students')
        .update({
          name: input.name,
          grade: input.grade,
          school: input.school,
          class_id: input.classId || null,
          status: input.status,
          phone: input.phone ?? null,
          note: input.note ?? null,
          updated_at: updatedAt,
        })
        .eq('id', id)
        .then(({ error }) => error && reportSyncFailure(error));
    };

    const deleteStudent = (id: string) => {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      supabase
        .from('students')
        .delete()
        .eq('id', id)
        .then(({ error }) => error && reportSyncFailure(error));
    };

    const addClass = (input: ClassInput): SchoolClass => {
      const schoolClass: SchoolClass = { ...input, id: newId(), sessions: [] };
      setClasses((prev) => [...prev, schoolClass]);
      supabase
        .from('classes')
        .insert({
          id: schoolClass.id,
          name: schoolClass.name,
          grade_band: schoolClass.gradeBand ?? null,
          days_of_week: schoolClass.daysOfWeek,
          time: schoolClass.time ?? null,
          location: schoolClass.location,
          main_textbook_id: schoolClass.mainTextbookId ?? null,
        })
        .then(({ error }) => error && reportSyncFailure(error));
      return schoolClass;
    };

    const updateClass = (id: string, input: ClassInput) => {
      patchClass(id, (c) => ({ ...c, ...input }));
      supabase
        .from('classes')
        .update({
          name: input.name,
          grade_band: input.gradeBand ?? null,
          days_of_week: input.daysOfWeek,
          time: input.time ?? null,
          location: input.location,
          main_textbook_id: input.mainTextbookId ?? null,
        })
        .eq('id', id)
        .then(({ error }) => error && reportSyncFailure(error));
    };

    const deleteClass = (id: string) => {
      setClasses((prev) => prev.filter((c) => c.id !== id));
      supabase
        .from('classes')
        .delete()
        .eq('id', id)
        .then(({ error }) => error && reportSyncFailure(error));
    };

    const addTextbook = (input: TextbookInput): Textbook => {
      const textbook: Textbook = { ...input, id: newId() };
      setTextbooks((prev) => [...prev, textbook]);
      supabase
        .from('textbooks')
        .insert({
          id: textbook.id,
          title: textbook.title,
          author: textbook.author ?? null,
          publisher: textbook.publisher ?? null,
          grades: textbook.grades,
          stage: textbook.stage ?? null,
          description: textbook.description ?? null,
        })
        .then(({ error }) => error && reportSyncFailure(error));
      return textbook;
    };

    const updateTextbook = (id: string, input: TextbookInput) => {
      setTextbooks((prev) => prev.map((t) => (t.id === id ? { ...t, ...input } : t)));
      supabase
        .from('textbooks')
        .update({
          title: input.title,
          author: input.author ?? null,
          publisher: input.publisher ?? null,
          grades: input.grades,
          stage: input.stage ?? null,
          description: input.description ?? null,
        })
        .eq('id', id)
        .then(({ error }) => error && reportSyncFailure(error));
    };

    const deleteTextbook = (id: string) => {
      setTextbooks((prev) => prev.filter((t) => t.id !== id));
      setClasses((prev) =>
        prev.map((c) => ({
          ...c,
          mainTextbookId: c.mainTextbookId === id ? undefined : c.mainTextbookId,
          sessions: c.sessions.map((s) => (s.textbookId === id ? { ...s, textbookId: undefined } : s)),
        })),
      );
      // classes.main_textbook_id / curriculum_sessions.textbook_id are ON DELETE SET NULL in the DB
      supabase
        .from('textbooks')
        .delete()
        .eq('id', id)
        .then(({ error }) => error && reportSyncFailure(error));
    };

    const addSession: AppDataContextValue['addSession'] = (classId, input) => {
      const targetClass = classes.find((c) => c.id === classId);
      if (!targetClass) return;
      const session: CurriculumSession = { ...input, id: newId(), completed: false };
      const position = targetClass.sessions.length;
      patchClass(classId, (c) => ({ ...c, sessions: [...c.sessions, session] }));
      supabase
        .from('curriculum_sessions')
        .insert({
          id: session.id,
          class_id: classId,
          date: session.date ?? null,
          topic: session.topic,
          textbook_id: session.textbookId ?? null,
          summary: session.summary ?? null,
          completed: false,
          position,
        })
        .then(({ error }) => error && reportSyncFailure(error));
    };

    const updateSession: AppDataContextValue['updateSession'] = (classId, sessionId, input) => {
      patchClass(classId, (c) => ({
        ...c,
        sessions: c.sessions.map((s) => (s.id === sessionId ? { ...s, ...input } : s)),
      }));
      supabase
        .from('curriculum_sessions')
        .update({
          date: input.date ?? null,
          topic: input.topic,
          textbook_id: input.textbookId ?? null,
          summary: input.summary ?? null,
        })
        .eq('id', sessionId)
        .then(({ error }) => error && reportSyncFailure(error));
    };

    const toggleSessionCompleted: AppDataContextValue['toggleSessionCompleted'] = (classId, sessionId) => {
      const targetSession = classes.find((c) => c.id === classId)?.sessions.find((s) => s.id === sessionId);
      const nextCompleted = !(targetSession?.completed ?? false);
      patchClass(classId, (c) => ({
        ...c,
        sessions: c.sessions.map((s) => (s.id === sessionId ? { ...s, completed: !s.completed } : s)),
      }));
      supabase
        .from('curriculum_sessions')
        .update({ completed: nextCompleted })
        .eq('id', sessionId)
        .then(({ error }) => error && reportSyncFailure(error));
    };

    const removeSession: AppDataContextValue['removeSession'] = (classId, sessionId) => {
      patchClass(classId, (c) => ({
        ...c,
        sessions: c.sessions.filter((s) => s.id !== sessionId),
      }));
      supabase
        .from('curriculum_sessions')
        .delete()
        .eq('id', sessionId)
        .then(({ error }) => error && reportSyncFailure(error));
    };

    const moveSession: AppDataContextValue['moveSession'] = (classId, sessionId, direction) => {
      const targetClass = classes.find((c) => c.id === classId);
      if (!targetClass) return;
      const index = targetClass.sessions.findIndex((s) => s.id === sessionId);
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (index === -1 || targetIndex < 0 || targetIndex >= targetClass.sessions.length) return;
      const sessions = [...targetClass.sessions];
      [sessions[index], sessions[targetIndex]] = [sessions[targetIndex], sessions[index]];
      patchClass(classId, (c) => ({ ...c, sessions }));
      Promise.all(sessions.map((s, i) => supabase.from('curriculum_sessions').update({ position: i }).eq('id', s.id))).then(
        (results) => {
          const failed = results.find((r) => r.error);
          if (failed?.error) reportSyncFailure(failed.error);
        },
      );
    };

    const addReadingRecord: AppDataContextValue['addReadingRecord'] = (studentId, record) => {
      const newRecord: ReadingRecord = { ...record, id: newId() };
      patchStudent(studentId, (s) => ({
        ...s,
        readingHistory: [newRecord, ...s.readingHistory],
        updatedAt: new Date().toISOString(),
      }));
      supabase
        .from('reading_records')
        .insert({
          id: newRecord.id,
          student_id: studentId,
          date: newRecord.date,
          title: newRecord.title,
          author: newRecord.author || null,
          memo: newRecord.memo || null,
        })
        .then(({ error }) => error && reportSyncFailure(error));
    };
    const removeReadingRecord: AppDataContextValue['removeReadingRecord'] = (studentId, recordId) => {
      patchStudent(studentId, (s) => ({
        ...s,
        readingHistory: s.readingHistory.filter((r) => r.id !== recordId),
      }));
      supabase
        .from('reading_records')
        .delete()
        .eq('id', recordId)
        .then(({ error }) => error && reportSyncFailure(error));
    };

    const addFeedbackRecord: AppDataContextValue['addFeedbackRecord'] = (studentId, record) => {
      const newRecord: FeedbackRecord = { ...record, id: newId() };
      patchStudent(studentId, (s) => ({
        ...s,
        feedbackHistory: [newRecord, ...s.feedbackHistory],
        updatedAt: new Date().toISOString(),
      }));
      supabase
        .from('feedback_records')
        .insert({
          id: newRecord.id,
          student_id: studentId,
          date: newRecord.date,
          title: newRecord.title,
          content: newRecord.content || null,
          score: newRecord.score ?? null,
        })
        .then(({ error }) => error && reportSyncFailure(error));
    };
    const removeFeedbackRecord: AppDataContextValue['removeFeedbackRecord'] = (studentId, recordId) => {
      patchStudent(studentId, (s) => ({
        ...s,
        feedbackHistory: s.feedbackHistory.filter((r) => r.id !== recordId),
      }));
      supabase
        .from('feedback_records')
        .delete()
        .eq('id', recordId)
        .then(({ error }) => error && reportSyncFailure(error));
    };

    const addAttendanceRecord: AppDataContextValue['addAttendanceRecord'] = (studentId, record) => {
      const targetStudent = students.find((s) => s.id === studentId);
      const existing = targetStudent?.attendanceHistory.find((r) => r.date === record.date);
      const newRecord: AttendanceRecord = { ...record, id: existing?.id ?? newId() };
      patchStudent(studentId, (s) => ({
        ...s,
        attendanceHistory: existing
          ? s.attendanceHistory.map((r) => (r.id === existing.id ? newRecord : r))
          : [newRecord, ...s.attendanceHistory],
        updatedAt: new Date().toISOString(),
      }));
      supabase
        .from('attendance_records')
        .upsert(
          { id: newRecord.id, student_id: studentId, date: newRecord.date, status: newRecord.status, memo: newRecord.memo ?? null },
          { onConflict: 'student_id,date' },
        )
        .then(({ error }) => error && reportSyncFailure(error));
    };
    const removeAttendanceRecord: AppDataContextValue['removeAttendanceRecord'] = (studentId, recordId) => {
      patchStudent(studentId, (s) => ({
        ...s,
        attendanceHistory: s.attendanceHistory.filter((r) => r.id !== recordId),
      }));
      supabase
        .from('attendance_records')
        .delete()
        .eq('id', recordId)
        .then(({ error }) => error && reportSyncFailure(error));
    };

    const setAttendanceStatus: AppDataContextValue['setAttendanceStatus'] = (studentId, date, status) => {
      const targetStudent = students.find((s) => s.id === studentId);
      const existing = targetStudent?.attendanceHistory.find((r) => r.date === date);

      if (existing && existing.status === status) {
        patchStudent(studentId, (s) => ({
          ...s,
          attendanceHistory: s.attendanceHistory.filter((r) => r.id !== existing.id),
        }));
        supabase
          .from('attendance_records')
          .delete()
          .eq('id', existing.id)
          .then(({ error }) => error && reportSyncFailure(error));
        return;
      }

      const recordId = existing?.id ?? newId();
      patchStudent(studentId, (s) => {
        if (existing) {
          return {
            ...s,
            attendanceHistory: s.attendanceHistory.map((r) => (r.id === existing.id ? { ...r, status } : r)),
          };
        }
        return { ...s, attendanceHistory: [{ id: recordId, date, status }, ...s.attendanceHistory] };
      });
      supabase
        .from('attendance_records')
        .upsert({ id: recordId, student_id: studentId, date, status }, { onConflict: 'student_id,date' })
        .then(({ error }) => error && reportSyncFailure(error));
    };

    const addConsultationRecord: AppDataContextValue['addConsultationRecord'] = (studentId, record) => {
      const newRecord: ConsultationRecord = { ...record, id: newId() };
      patchStudent(studentId, (s) => ({
        ...s,
        consultationHistory: [newRecord, ...s.consultationHistory],
        updatedAt: new Date().toISOString(),
      }));
      supabase
        .from('consultation_records')
        .insert({
          id: newRecord.id,
          student_id: studentId,
          date: newRecord.date,
          type: newRecord.type || null,
          content: newRecord.content || null,
          next_consultation_date: newRecord.nextConsultationDate || null,
        })
        .then(({ error }) => error && reportSyncFailure(error));
    };
    const removeConsultationRecord: AppDataContextValue['removeConsultationRecord'] = (studentId, recordId) => {
      patchStudent(studentId, (s) => ({
        ...s,
        consultationHistory: s.consultationHistory.filter((r) => r.id !== recordId),
      }));
      supabase
        .from('consultation_records')
        .delete()
        .eq('id', recordId)
        .then(({ error }) => error && reportSyncFailure(error));
    };

    const addEvaluation = (studentId: string, input: EvaluationInput): Evaluation => {
      const now = new Date().toISOString();
      const evaluation: Evaluation = { ...input, id: newId(), studentId, createdAt: now, updatedAt: now };
      setEvaluations((prev) => [...prev, evaluation]);
      supabase
        .from('evaluations')
        .insert({
          id: evaluation.id,
          student_id: studentId,
          date: evaluation.date,
          listening: evaluation.listening,
          reading: evaluation.reading,
          speaking: evaluation.speaking,
          thinking: evaluation.thinking,
          writing: evaluation.writing,
          created_at: now,
          updated_at: now,
        })
        .then(({ error }) => error && reportSyncFailure(error));
      return evaluation;
    };

    const updateEvaluation = (id: string, input: EvaluationInput) => {
      const updatedAt = new Date().toISOString();
      setEvaluations((prev) => prev.map((e) => (e.id === id ? { ...e, ...input, updatedAt } : e)));
      supabase
        .from('evaluations')
        .update({
          date: input.date,
          listening: input.listening,
          reading: input.reading,
          speaking: input.speaking,
          thinking: input.thinking,
          writing: input.writing,
          updated_at: updatedAt,
        })
        .eq('id', id)
        .then(({ error }) => error && reportSyncFailure(error));
    };

    const deleteEvaluation = (id: string) => {
      setEvaluations((prev) => prev.filter((e) => e.id !== id));
      supabase
        .from('evaluations')
        .delete()
        .eq('id', id)
        .then(({ error }) => error && reportSyncFailure(error));
    };

    const getNotificationsForStudent = (studentId: string) =>
      notifications.filter((n) => n.studentId === studentId).sort((a, b) => b.sentAt.localeCompare(a.sentAt));

    const addNotificationLog = (input: NotificationLogInput): NotificationLog => {
      const sentAt = new Date().toISOString();
      const log: NotificationLog = { ...input, id: newId(), sentAt, answered: false };
      setNotifications((prev) => [...prev, log]);
      supabase
        .from('notification_logs')
        .insert({
          id: log.id,
          student_id: log.studentId,
          type: log.type,
          channel: log.channel,
          subject: log.subject || null,
          body: log.body || null,
          sent_at: sentAt,
          answered: false,
        })
        .then(({ error }) => error && reportSyncFailure(error));
      return log;
    };

    const markNotificationAnswered = (id: string, answered: boolean) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, answered } : n)));
      supabase
        .from('notification_logs')
        .update({ answered })
        .eq('id', id)
        .then(({ error }) => error && reportSyncFailure(error));
    };

    return {
      students,
      classes,
      textbooks,
      evaluations,
      notifications,
      getNotificationsForStudent,
      addNotificationLog,
      markNotificationAnswered,
      getStudent,
      getClass,
      getTextbook,
      getEvaluation,
      getEvaluationsForStudent,
      addEvaluation,
      updateEvaluation,
      deleteEvaluation,
      addStudent,
      updateStudent,
      deleteStudent,
      addClass,
      updateClass,
      deleteClass,
      addTextbook,
      updateTextbook,
      deleteTextbook,
      addSession,
      updateSession,
      toggleSessionCompleted,
      removeSession,
      moveSession,
      addReadingRecord,
      removeReadingRecord,
      addFeedbackRecord,
      removeFeedbackRecord,
      addAttendanceRecord,
      removeAttendanceRecord,
      setAttendanceStatus,
      addConsultationRecord,
      removeConsultationRecord,
    };
  }, [students, classes, textbooks, evaluations, notifications, reportSyncFailure]);

  if (!teacherId) return null;

  return (
    <AppDataContext.Provider value={value}>
      {syncError && (
        <div className="fixed inset-x-0 top-0 z-50 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-white">
          {syncError}
        </div>
      )}
      {loading ? (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
        </div>
      ) : (
        children
      )}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
