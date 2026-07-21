import type { StudentStatus } from '../types/student';

const STYLES: Record<StudentStatus, string> = {
  재원: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  휴원: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  퇴원: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};

export function StatusBadge({ status }: { status: StudentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
