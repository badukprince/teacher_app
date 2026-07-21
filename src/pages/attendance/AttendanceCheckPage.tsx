import { useMemo, useState } from 'react';
import { useAppData } from '../../store/AppDataContext';
import { AttendanceTabs } from './AttendanceTabs';
import { ATTENDANCE_STATUS_OPTIONS } from '../../lib/constants';
import { ATTENDANCE_STATUS_SOLID } from '../../lib/attendanceStyles';
import { inputClass } from '../../lib/formStyles';
import { todayISO } from '../../lib/date';
import { UsersIcon } from '../../components/icons';

export function AttendanceCheckPage() {
  const { classes, students, setAttendanceStatus } = useAppData();
  const [classId, setClassId] = useState(() => classes[0]?.id ?? '');
  const [date, setDate] = useState(todayISO());

  const roster = useMemo(
    () =>
      students
        .filter((s) => s.classId === classId && s.status === '재원')
        .sort((a, b) => a.name.localeCompare(b.name, 'ko')),
    [students, classId],
  );

  const summary = ATTENDANCE_STATUS_OPTIONS.map((status) => ({
    status,
    count: roster.filter((s) => s.attendanceHistory.find((r) => r.date === date)?.status === status).length,
  }));
  const uncheckedCount = roster.length - summary.reduce((sum, s) => sum + s.count, 0);

  return (
    <div>
      <div>
        <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">출결관리</h1>
        <p className="mt-1 text-sm text-slate-500">반과 날짜를 선택하고 버튼 한 번으로 출결을 체크하세요.</p>
      </div>

      <div className="mt-5">
        <AttendanceTabs />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className={`${inputClass} sm:max-w-xs`}
        >
          {classes.length === 0 && <option value="">등록된 반이 없어요</option>}
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={`${inputClass} sm:max-w-xs`}
        />
      </div>

      {classes.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
          <UsersIcon className="h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">등록된 반이 없어요</p>
          <p className="mt-1 text-sm text-slate-500">수업/커리큘럼 메뉴에서 반을 먼저 만들어주세요.</p>
        </div>
      ) : roster.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
          <UsersIcon className="h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">이 반에 재원 중인 학생이 없어요</p>
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
            {summary.map((s) => (
              <span key={s.status}>{s.status} {s.count}명</span>
            ))}
            <span className="text-slate-400">미체크 {uncheckedCount}명</span>
          </div>

          <ul className="mt-4 flex flex-col gap-2">
            {roster.map((s) => {
              const current = s.attendanceHistory.find((r) => r.date === date)?.status;
              return (
                <li
                  key={s.id}
                  className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="truncate text-sm font-medium text-slate-900">{s.name}</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {ATTENDANCE_STATUS_OPTIONS.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setAttendanceStatus(s.id, date, status)}
                        aria-pressed={current === status}
                        className={`rounded-lg px-3 py-2.5 text-xs font-semibold ring-1 ring-inset ring-slate-200 transition-colors ${
                          current === status ? ATTENDANCE_STATUS_SOLID[status] : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
