import { ATTENDANCE_STATUS_BADGE } from '../../../lib/attendanceStyles';
import type { Student } from '../../../types/student';

export function ParentAttendanceTab({ student }: { student: Student }) {
  const sorted = [...student.attendanceHistory].sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        아직 출결 이력이 없어요.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {sorted.map((r) => (
        <li key={r.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5">
          <span className={`inline-flex w-12 justify-center rounded-full px-2 py-0.5 text-xs font-medium ${ATTENDANCE_STATUS_BADGE[r.status]}`}>
            {r.status}
          </span>
          <span className="text-sm text-slate-700">{r.date}</span>
          {r.memo && <span className="text-sm text-slate-500">{r.memo}</span>}
        </li>
      ))}
    </ul>
  );
}
