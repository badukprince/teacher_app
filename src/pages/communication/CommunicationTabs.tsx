import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/communication', label: '알림 발송', end: true },
  { to: '/communication/consultations', label: '상담 기록', end: false },
];

export function CommunicationTabs() {
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
