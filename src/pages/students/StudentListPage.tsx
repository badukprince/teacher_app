import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../store/AppDataContext';
import { GRADE_OPTIONS, STATUS_OPTIONS } from '../../lib/constants';
import { StatusBadge } from '../../components/StatusBadge';
import { PhoneIcon, PlusIcon, SearchIcon, UsersIcon } from '../../components/icons';
import type { Student } from '../../types/student';

function primaryPhone(student: Student): string {
  const primary = student.parentContacts.find((p) => p.isPrimary) ?? student.parentContacts[0];
  return primary?.phone ?? '-';
}

export function StudentListPage() {
  const { students, classes, getClass } = useAppData();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students
      .filter((s) => classFilter === 'all' || s.classId === classFilter)
      .filter((s) => gradeFilter === 'all' || s.grade === gradeFilter)
      .filter((s) => statusFilter === 'all' || s.status === statusFilter)
      .filter((s) => {
        if (!q) return true;
        const haystack = [s.name, s.school, primaryPhone(s)].join(' ').toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }, [students, classFilter, gradeFilter, statusFilter, search]);

  const hasActiveFilters = classFilter !== 'all' || gradeFilter !== 'all' || statusFilter !== 'all' || search !== '';

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">학생관리</h1>
          <p className="mt-1 text-sm text-slate-500">전체 {students.length}명 · 조회 결과 {filtered.length}명</p>
        </div>
        <Link
          to="/students/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          <PlusIcon className="h-4 w-4" />
          신규 등록
        </Link>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름, 학교, 연락처 검색"
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">전체 반</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">전체 학년</option>
            {GRADE_OPTIONS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">전체 상태</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
          <UsersIcon className="h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">
            {hasActiveFilters ? '조건에 맞는 학생이 없어요' : '등록된 학생이 없어요'}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {hasActiveFilters ? '검색어나 필터를 조정해보세요.' : '신규 등록 버튼을 눌러 학생을 추가해보세요.'}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">이름</th>
                  <th className="px-4 py-3 font-medium">학년/학교</th>
                  <th className="px-4 py-3 font-medium">반</th>
                  <th className="px-4 py-3 font-medium">학부모 연락처</th>
                  <th className="px-4 py-3 font-medium">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="cursor-pointer hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link to={`/students/${s.id}`} className="font-medium text-slate-900 hover:text-brand-600">
                        {s.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="mr-1.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                        {s.grade}
                      </span>
                      {s.school}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{getClass(s.classId)?.name ?? '미배정'}</td>
                    <td className="px-4 py-3 text-slate-600">{primaryPhone(s)}</td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-6 flex flex-col gap-3 md:hidden">
            {filtered.map((s) => (
              <li key={s.id}>
                <Link
                  to={`/students/${s.id}`}
                  className="block rounded-xl border border-slate-200 bg-white p-4 active:bg-slate-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{s.name}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">{s.grade}</span>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{s.school} · {getClass(s.classId)?.name ?? '미배정'}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
                    <PhoneIcon className="h-3.5 w-3.5 text-slate-400" />
                    {primaryPhone(s)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
