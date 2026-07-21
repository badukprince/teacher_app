import type { StudentStatus } from '../types/student';
import { STATUS_OPTIONS } from '../lib/constants';
import { ChevronDownIcon } from './icons';

const STYLES: Record<StudentStatus, string> = {
  재원: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  휴원: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  퇴원: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};

interface StatusToggleProps {
  status: StudentStatus;
  onChange: (status: StudentStatus) => void;
}

export function StatusToggle({ status, onChange }: StatusToggleProps) {
  return (
    <span
      className={`relative inline-flex items-center rounded-full ring-1 ring-inset ${STYLES[status]}`}
      onClick={(e) => e.stopPropagation()}
    >
      <select
        value={status}
        onChange={(e) => onChange(e.target.value as StudentStatus)}
        aria-label="재원 상태 변경"
        className="cursor-pointer appearance-none rounded-full bg-transparent py-0.5 pl-2.5 pr-6 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-1.5 h-3 w-3" />
    </span>
  );
}
