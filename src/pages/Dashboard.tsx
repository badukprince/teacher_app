import { Link } from 'react-router-dom';
import { useAppData } from '../store/AppDataContext';
import { UsersIcon } from '../components/icons';

export function Dashboard() {
  const { students, classes } = useAppData();

  const activeCount = students.filter((s) => s.status === '재원').length;
  const pausedCount = students.filter((s) => s.status === '휴원').length;
  const withdrawnCount = students.filter((s) => s.status === '퇴원').length;

  const stats = [
    { label: '전체 학생', value: students.length },
    { label: '재원', value: activeCount },
    { label: '휴원', value: pausedCount },
    { label: '퇴원', value: withdrawnCount },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">대시보드</h1>
      <p className="mt-1 text-sm text-slate-500">오늘도 좋은 수업 되세요.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">반별 인원</h2>
          <Link to="/students" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            학생관리로 이동 →
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-slate-100">
          {classes.map((c) => {
            const count = students.filter((s) => s.classId === c.id && s.status === '재원').length;
            return (
              <li key={c.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{c.name}</p>
                  {c.schedule && <p className="text-xs text-slate-500">{c.schedule}</p>}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                  <UsersIcon className="h-4 w-4 text-slate-400" />
                  {count}명
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
