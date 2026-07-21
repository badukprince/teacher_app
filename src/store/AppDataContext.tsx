import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
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
import type { SessionInput, Textbook, TextbookInput } from '../types/curriculum';
import type { Evaluation, EvaluationInput } from '../types/evaluation';
import type { NotificationLog, NotificationLogInput } from '../types/communication';
import { loadFromStorage, newId, saveToStorage } from '../lib/storage';
import { seedClasses, seedEvaluations, seedNotificationLogs, seedStudents, seedTextbooks } from '../data/seedData';

const STUDENTS_KEY = 'ronsul.students.v1';
const CLASSES_KEY = 'ronsul.classes.v1';
const TEXTBOOKS_KEY = 'ronsul.textbooks.v1';
const EVALUATIONS_KEY = 'ronsul.evaluations.v1';
const NOTIFICATIONS_KEY = 'ronsul.notifications.v1';

type ClassInput = Pick<SchoolClass, 'name' | 'gradeBand' | 'schedule' | 'mainTextbookId'>;

interface AppDataContextValue {
  students: Student[];
  classes: SchoolClass[];
  textbooks: Textbook[];
  evaluations: Evaluation[];
  notifications: NotificationLog[];
  getNotificationsForStudent: (studentId: string) => NotificationLog[];
  addNotificationLog: (input: NotificationLogInput) => NotificationLog;
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
  const [students, setStudents] = useState<Student[]>(() => loadFromStorage(STUDENTS_KEY, seedStudents));
  const [classes, setClasses] = useState<SchoolClass[]>(() =>
    loadFromStorage(CLASSES_KEY, seedClasses).map((c) => ({ ...c, sessions: c.sessions ?? [] })),
  );
  const [textbooks, setTextbooks] = useState<Textbook[]>(() => loadFromStorage(TEXTBOOKS_KEY, seedTextbooks));
  const [evaluations, setEvaluations] = useState<Evaluation[]>(() => loadFromStorage(EVALUATIONS_KEY, seedEvaluations));
  const [notifications, setNotifications] = useState<NotificationLog[]>(() =>
    loadFromStorage(NOTIFICATIONS_KEY, seedNotificationLogs),
  );

  useEffect(() => saveToStorage(STUDENTS_KEY, students), [students]);
  useEffect(() => saveToStorage(CLASSES_KEY, classes), [classes]);
  useEffect(() => saveToStorage(TEXTBOOKS_KEY, textbooks), [textbooks]);
  useEffect(() => saveToStorage(EVALUATIONS_KEY, evaluations), [evaluations]);
  useEffect(() => saveToStorage(NOTIFICATIONS_KEY, notifications), [notifications]);

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
      return student;
    };

    const updateStudent = (id: string, input: StudentInput) => {
      patchStudent(id, (s) => ({ ...s, ...input, updatedAt: new Date().toISOString() }));
    };

    const deleteStudent = (id: string) => {
      setStudents((prev) => prev.filter((s) => s.id !== id));
    };

    const addClass = (input: ClassInput): SchoolClass => {
      const schoolClass: SchoolClass = { ...input, id: newId(), sessions: [] };
      setClasses((prev) => [...prev, schoolClass]);
      return schoolClass;
    };

    const updateClass = (id: string, input: ClassInput) => {
      patchClass(id, (c) => ({ ...c, ...input }));
    };

    const deleteClass = (id: string) => {
      setClasses((prev) => prev.filter((c) => c.id !== id));
    };

    const addTextbook = (input: TextbookInput): Textbook => {
      const textbook: Textbook = { ...input, id: newId() };
      setTextbooks((prev) => [...prev, textbook]);
      return textbook;
    };

    const updateTextbook = (id: string, input: TextbookInput) => {
      setTextbooks((prev) => prev.map((t) => (t.id === id ? { ...t, ...input } : t)));
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
    };

    const addSession: AppDataContextValue['addSession'] = (classId, input) => {
      patchClass(classId, (c) => ({
        ...c,
        sessions: [...c.sessions, { ...input, id: newId(), completed: false }],
      }));
    };

    const updateSession: AppDataContextValue['updateSession'] = (classId, sessionId, input) => {
      patchClass(classId, (c) => ({
        ...c,
        sessions: c.sessions.map((s) => (s.id === sessionId ? { ...s, ...input } : s)),
      }));
    };

    const toggleSessionCompleted: AppDataContextValue['toggleSessionCompleted'] = (classId, sessionId) => {
      patchClass(classId, (c) => ({
        ...c,
        sessions: c.sessions.map((s) => (s.id === sessionId ? { ...s, completed: !s.completed } : s)),
      }));
    };

    const removeSession: AppDataContextValue['removeSession'] = (classId, sessionId) => {
      patchClass(classId, (c) => ({
        ...c,
        sessions: c.sessions.filter((s) => s.id !== sessionId),
      }));
    };

    const moveSession: AppDataContextValue['moveSession'] = (classId, sessionId, direction) => {
      patchClass(classId, (c) => {
        const index = c.sessions.findIndex((s) => s.id === sessionId);
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (index === -1 || targetIndex < 0 || targetIndex >= c.sessions.length) return c;
        const sessions = [...c.sessions];
        [sessions[index], sessions[targetIndex]] = [sessions[targetIndex], sessions[index]];
        return { ...c, sessions };
      });
    };

    const addReadingRecord: AppDataContextValue['addReadingRecord'] = (studentId, record) => {
      patchStudent(studentId, (s) => ({
        ...s,
        readingHistory: [{ ...record, id: newId() }, ...s.readingHistory],
        updatedAt: new Date().toISOString(),
      }));
    };
    const removeReadingRecord: AppDataContextValue['removeReadingRecord'] = (studentId, recordId) => {
      patchStudent(studentId, (s) => ({
        ...s,
        readingHistory: s.readingHistory.filter((r) => r.id !== recordId),
      }));
    };

    const addFeedbackRecord: AppDataContextValue['addFeedbackRecord'] = (studentId, record) => {
      patchStudent(studentId, (s) => ({
        ...s,
        feedbackHistory: [{ ...record, id: newId() }, ...s.feedbackHistory],
        updatedAt: new Date().toISOString(),
      }));
    };
    const removeFeedbackRecord: AppDataContextValue['removeFeedbackRecord'] = (studentId, recordId) => {
      patchStudent(studentId, (s) => ({
        ...s,
        feedbackHistory: s.feedbackHistory.filter((r) => r.id !== recordId),
      }));
    };

    const addAttendanceRecord: AppDataContextValue['addAttendanceRecord'] = (studentId, record) => {
      patchStudent(studentId, (s) => ({
        ...s,
        attendanceHistory: [{ ...record, id: newId() }, ...s.attendanceHistory],
        updatedAt: new Date().toISOString(),
      }));
    };
    const removeAttendanceRecord: AppDataContextValue['removeAttendanceRecord'] = (studentId, recordId) => {
      patchStudent(studentId, (s) => ({
        ...s,
        attendanceHistory: s.attendanceHistory.filter((r) => r.id !== recordId),
      }));
    };

    const setAttendanceStatus: AppDataContextValue['setAttendanceStatus'] = (studentId, date, status) => {
      patchStudent(studentId, (s) => {
        const existing = s.attendanceHistory.find((r) => r.date === date);
        if (existing && existing.status === status) {
          return { ...s, attendanceHistory: s.attendanceHistory.filter((r) => r.id !== existing.id) };
        }
        if (existing) {
          return {
            ...s,
            attendanceHistory: s.attendanceHistory.map((r) => (r.id === existing.id ? { ...r, status } : r)),
          };
        }
        return {
          ...s,
          attendanceHistory: [{ id: newId(), date, status }, ...s.attendanceHistory],
        };
      });
    };

    const addConsultationRecord: AppDataContextValue['addConsultationRecord'] = (studentId, record) => {
      patchStudent(studentId, (s) => ({
        ...s,
        consultationHistory: [{ ...record, id: newId() }, ...s.consultationHistory],
        updatedAt: new Date().toISOString(),
      }));
    };
    const removeConsultationRecord: AppDataContextValue['removeConsultationRecord'] = (studentId, recordId) => {
      patchStudent(studentId, (s) => ({
        ...s,
        consultationHistory: s.consultationHistory.filter((r) => r.id !== recordId),
      }));
    };

    const addEvaluation = (studentId: string, input: EvaluationInput): Evaluation => {
      const now = new Date().toISOString();
      const evaluation: Evaluation = { ...input, id: newId(), studentId, createdAt: now, updatedAt: now };
      setEvaluations((prev) => [...prev, evaluation]);
      return evaluation;
    };

    const updateEvaluation = (id: string, input: EvaluationInput) => {
      setEvaluations((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...input, updatedAt: new Date().toISOString() } : e)),
      );
    };

    const deleteEvaluation = (id: string) => {
      setEvaluations((prev) => prev.filter((e) => e.id !== id));
    };

    const getNotificationsForStudent = (studentId: string) =>
      notifications.filter((n) => n.studentId === studentId).sort((a, b) => b.sentAt.localeCompare(a.sentAt));

    const addNotificationLog = (input: NotificationLogInput): NotificationLog => {
      const log: NotificationLog = { ...input, id: newId(), sentAt: new Date().toISOString() };
      setNotifications((prev) => [...prev, log]);
      return log;
    };

    return {
      students,
      classes,
      textbooks,
      evaluations,
      notifications,
      getNotificationsForStudent,
      addNotificationLog,
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
  }, [students, classes, textbooks, evaluations, notifications]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
