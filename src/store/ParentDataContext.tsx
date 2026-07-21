import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Evaluation } from '../types/evaluation';
import type { SchoolClass, Student } from '../types/student';
import { fetchParentStudentData } from '../lib/supabaseMappers';
import { useAuth } from './AuthContext';

interface ParentDataContextValue {
  student: Student | null;
  schoolClass: SchoolClass | null;
  evaluations: Evaluation[];
  loading: boolean;
  error: string | null;
}

const ParentDataContext = createContext<ParentDataContextValue | null>(null);

export function ParentDataProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [student, setStudent] = useState<Student | null>(null);
  const [schoolClass, setSchoolClass] = useState<SchoolClass | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    fetchParentStudentData()
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setError('연결된 학생 정보를 찾을 수 없어요. 강사에게 문의해주세요.');
          return;
        }
        setStudent(data.student);
        setSchoolClass(data.schoolClass);
        setEvaluations(data.evaluations);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setError('데이터를 불러오지 못했어요. 새로고침해주세요.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <ParentDataContext.Provider value={{ student, schoolClass, evaluations, loading, error }}>
      {children}
    </ParentDataContext.Provider>
  );
}

export function useParentData(): ParentDataContextValue {
  const ctx = useContext(ParentDataContext);
  if (!ctx) throw new Error('useParentData must be used within ParentDataProvider');
  return ctx;
}
