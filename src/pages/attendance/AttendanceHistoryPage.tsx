import { useMemo, useState } from 'react';
import { useAppData } from '../../store/AppDataContext';
import { AttendanceTabs } from './AttendanceTabs';
import { ATTENDANCE_STATUS_OPTIONS } from '../../lib/constants';
import { ATTENDANCE_STATUS_BADGE } from '../../lib/attendanceStyles';
import { inputClass } from '../../lib/formStyles';
import { ChevronLeftIcon, ChevronRightIcon, TrashIcon, UsersIcon } from '../../components/icons';
import type { AttendanceRecord, AttendanceStatus } from '../../types/student';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function currentMonthValue() {
  return new Date().toISOString().slice(0, 7);
}

function shiftMonth(value: string, delta: number): string {
  const [year, month] = value.split('-').map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function buildCalendarWeeks(monthValue: string): (number | null)[][] {
  const [year, month] = monthValue.split('-').map(Number);
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

interface FlatRecord {
  studentId: string;
  studentName: string;
  record: AttendanceRecord;
}

export function AttendanceHistoryPage() {
  const { classes, students, removeAttendanceRecord } = useAppData();
  const [classId, setClassId] = useState('all');
  const [studentId, setStudentId] = useState('all');
  const [month, setMonth] = useState(currentMonthValue());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  const classStudents = useMemo(
    () => students.filter((s) => classId === 'all' || s.classId === classId),
    [students, classId],
  );

  const handleClassChange = (nextClassId: string) => {
    setClassId(nextClassId);
    if (studentId !== 'all' && !students.some((s) => s.id === studentId && (nextClassId === 'all' || s.classId === nextClassId))) {
      setStudentId('all');
    }
  };

  const filteredStudents = useMemo(
    () => (studentId === 'all' ? classStudents : classStudents.filter((s) => s.id === studentId)),
    [classStudents, studentId],
  );

  const monthRecords = useMemo<FlatRecord[]>(() => {
    const out: FlatRecord[] = [];
    for (const s of filteredStudents) {
      for (const r of s.attendanceHistory) {
        if (r.date.startsWith(month)) out.push({ studentId: s.id, studentName: s.name, record: r });
      }
    }
    return out.sort((a, b) => b.record.date.localeCompare(a.record.date) || a.studentName.localeCompare(b.studentName, 'ko'));
  }, [filteredStudents, month]);

  const recordsByDay = useMemo(() => {
    const map = new Map<number, FlatRecord[]>();
    for (const fr of monthRecords) {
      const day = Number(fr.record.date.slice(8, 10));
      const list = map.get(day) ?? [];
      list.push(fr);
      map.set(day, list);
    }
    return map;
  }, [monthRecords]);

  const weeks = useMemo(() => buildCalendarWeeks(month), [month]);
  const isSingleStudent = studentId !== 'all';

  const countsByStatus = (records: FlatRecord[]): { status: AttendanceStatus; count: number }[] =>
    ATTENDANCE_STATUS_OPTIONS.map((status) => ({
      status,
      count: records.filter((r) => r.record.status === status).length,
    })).filter((x) => x.count > 0);

  return (
    <div>
      <div>
        <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">출결관리</h1>
        <p className="mt-1 text-sm text-slate-500">월별 출결 이력을 캘린더나 목록으로 확인하세요.</p>
      </div>

      <div className="mt-5">
        <AttendanceTabs />
      </div>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <select value={classId} onChange={(e) => handleClassChange(e.target.value)} className={`${inputClass} sm:max-w-[160px]`}>
            <option value="all">전체 반</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className={`${inputClass} sm:max-w-[160px]`}>
            <option value="all">전체 학생</option>
            {classStudents.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-start">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMonth((m) => shiftMonth(m, -1))}
              className="rounded-lg border border-slate-300 p-2 text-slate-500 hover:bg-slate-50"
              aria-label="이전 달"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={inputClass} />
            <button
              type="button"
              onClick={() => setMonth((m) => shiftMonth(m, 1))}
              className="rounded-lg border border-slate-300 p-2 text-slate-500 hover:bg-slate-50"
              aria-label="다음 달"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="inline-flex shrink-0 rounded-lg border border-slate-300 p-0.5">
            {(['calendar', 'list'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === v ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {v === 'calendar' ? '캘린더' : '리스트'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {classStudents.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
          <UsersIcon className="h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">조건에 맞는 학생이 없어요</p>
        </div>
      ) : view === 'calendar' ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-medium text-slate-500">
            {WEEKDAY_LABELS.map((d) => (
              <div key={d} className="py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {weeks.map((week, wi) =>
              week.map((day, di) => {
                const dayRecords = day ? recordsByDay.get(day) ?? [] : [];
                return (
                  <div
                    key={`${wi}-${di}`}
                    className={`min-h-[68px] border-b border-r border-slate-100 p-1.5 last:border-r-0 sm:min-h-[84px] ${day ? '' : 'bg-slate-50/50'}`}
                  >
                    {day && (
                      <>
                        <p className="text-[11px] text-slate-400">{day}</p>
                        <div className="mt-1 flex flex-col gap-0.5">
                          {isSingleStudent
                            ? dayRecords.slice(0, 1).map((fr) => (
                                <span
                                  key={fr.record.id}
                                  className={`inline-flex items-center justify-center rounded px-1 py-0.5 text-[10px] font-medium ${ATTENDANCE_STATUS_BADGE[fr.record.status]}`}
                                >
                                  {fr.record.status}
                                </span>
                              ))
                            : countsByStatus(dayRecords).map(({ status, count }) => (
                                <span
                                  key={status}
                                  className={`inline-flex items-center justify-center rounded px-1 py-0.5 text-[10px] font-medium ${ATTENDANCE_STATUS_BADGE[status]}`}
                                >
                                  {status} {count}
                                </span>
                              ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              }),
            )}
          </div>
        </div>
      ) : monthRecords.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
          <p className="text-sm font-medium text-slate-700">이 달에는 출결 기록이 없어요</p>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {monthRecords.map(({ studentId: sid, studentName, record }) => (
            <li key={record.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className={`inline-flex w-12 shrink-0 justify-center rounded-full px-2 py-0.5 text-xs font-medium ${ATTENDANCE_STATUS_BADGE[record.status]}`}>
                  {record.status}
                </span>
                <span className="shrink-0 text-sm font-medium text-slate-900">{studentName}</span>
                <span className="shrink-0 text-sm text-slate-500">{record.date}</span>
                {record.memo && <span className="truncate text-sm text-slate-400">{record.memo}</span>}
              </div>
              <button
                type="button"
                onClick={() => window.confirm('이 기록을 삭제할까요?') && removeAttendanceRecord(sid, record.id)}
                className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                aria-label="삭제"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
