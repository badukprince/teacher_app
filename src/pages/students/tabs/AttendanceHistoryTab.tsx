import { useState, type FormEvent } from 'react';
import { useAppData } from '../../../store/AppDataContext';
import { inputClass, labelClass } from '../../../lib/formStyles';
import { ATTENDANCE_STATUS_OPTIONS } from '../../../lib/constants';
import { ATTENDANCE_STATUS_BADGE } from '../../../lib/attendanceStyles';
import { TrashIcon } from '../../../components/icons';
import type { AttendanceStatus, Student } from '../../../types/student';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function AttendanceHistoryTab({ student }: { student: Student }) {
  const { addAttendanceRecord, removeAttendanceRecord } = useAppData();
  const [date, setDate] = useState(todayISO());
  const [status, setStatus] = useState<AttendanceStatus>('출석');
  const [memo, setMemo] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    addAttendanceRecord(student.id, { date, status, memo: memo.trim() || undefined });
    setMemo('');
  };

  const sorted = [...student.attendanceHistory].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-slate-900">출결 기록 추가</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className={labelClass}>날짜</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>상태</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as AttendanceStatus)} className={inputClass}>
              {ATTENDANCE_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>메모</label>
            <input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="선택 입력" className={inputClass} />
          </div>
        </div>
        <button type="submit" className="mt-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          추가
        </button>
      </form>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          아직 출결 이력이 없어요.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((r) => (
            <li key={r.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="flex items-center gap-3">
                <span className={`inline-flex w-12 justify-center rounded-full px-2 py-0.5 text-xs font-medium ${ATTENDANCE_STATUS_BADGE[r.status]}`}>
                  {r.status}
                </span>
                <span className="text-sm text-slate-700">{r.date}</span>
                {r.memo && <span className="text-sm text-slate-500">{r.memo}</span>}
              </div>
              <button
                type="button"
                onClick={() => window.confirm('이 기록을 삭제할까요?') && removeAttendanceRecord(student.id, r.id)}
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
