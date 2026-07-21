import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../store/AppDataContext';
import { GRADE_OPTIONS } from '../../lib/constants';
import { inputClass } from '../../lib/formStyles';
import { overallScore } from '../../lib/evaluationConfig';
import { SearchIcon, UsersIcon } from '../../components/icons';

export function EvaluationStudentListPage() {
  const { students, classes, getClass, getEvaluationsForStudent } = useAppData();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students
      .filter((s) => classFilter === 'all' || s.classId === classFilter)
      .filter((s) => gradeFilter === 'all' || s.grade === gradeFilter)
      .filter((s) => !q || s.name.toLowerCase().includes(q) || s.school.toLowerCase().includes(q))
      .map((s) => {
        const evals = getEvaluationsForStudent(s.id);
        const latest = evals[evals.length - 1];
        return {
          student: s,
          latestDate: latest?.date,
          latestScore: latest ? overallScore(latest) : null,
          count: evals.length,
        };
      })
      .sort((a, b) => a.student.name.localeCompare(b.student.name, 'ko'));
  }, [students, classFilter, gradeFilter, search, getEvaluationsForStudent]);

  return (
    <div>
      <div>
        <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">수업평가</h1>
        <p className="mt-1 text-sm text-slate-500">학생을 선택해 평가를 입력하거나 이력을 확인하세요.</p>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름, 학교 검색"
              className={`${inputClass} pl-9`}
            />
          </div>
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className={inputClass}>
            <option value="all">전체 반</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className={inputClass}>
            <option value="all">전체 학년</option>
            {GRADE_OPTIONS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
          <UsersIcon className="h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">조건에 맞는 학생이 없어요</p>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ student, latestDate, latestScore, count }) => (
            <li key={student.id}>
              <Link
                to={`/evaluations/${student.id}`}
                className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-300 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">{student.name}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">{student.grade}</span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{student.school} · {getClass(student.classId)?.name ?? '미배정'}</p>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                  <span className="text-slate-500">{count > 0 ? `평가 ${count}회 · 최근 ${latestDate}` : '평가 기록 없음'}</span>
                  {latestScore !== null && (
                    <span className="font-semibold text-brand-700">{latestScore}점</span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
