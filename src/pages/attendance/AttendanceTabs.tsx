import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/attendance', label: '출결 체크', end: true },
  { to: '/attendance/history', label: '출결 이력', end: false },
];

export function AttendanceTabs() {
  return (
    <div className="flex gap-1 border-b border-slate-200">
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) =>
            `shrink-0 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${
              isActive ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`
          }
        >
          {t.label}
        </NavLink>
      ))}
    </div>
  );
}
