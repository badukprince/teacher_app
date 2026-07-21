import { Link } from 'react-router-dom';
import { useAppData } from '../store/AppDataContext';
import { UsersIcon, ClipboardCheckIcon, CalendarCheckIcon, ChatIcon } from '../components/icons';
import { WEEKDAY_FULL_LABEL, isClassToday, todayWeekday } from '../lib/classSchedule';
import { todayISO } from '../lib/date';

export function Dashboard() {
  const { students, classes, evaluations, notifications } = useAppData();
  const today = new Date();
  const todayDate = todayISO();
  const thisMonth = todayDate.slice(0, 7);

  const activeCount = students.filter((s) => s.status === '재원').length;
  const pausedCount = students.filter((s) => s.status === '휴원').length;
  const withdrawnCount = students.filter((s) => s.status === '퇴원').length;
  const newThisMonth = students.filter((s) => s.createdAt.slice(0, 7) === thisMonth).length;
  const withdrawnThisMonth = students.filter((s) => s.status === '퇴원' && s.updatedAt.slice(0, 7) === thisMonth).length;

  const stats = [
    { label: '전체 학생', value: students.length },
    { label: '재원', value: activeCount },
    { label: '휴원', value: pausedCount },
    { label: '퇴원', value: withdrawnCount },
  ];

  const classesToday = classes.filter((c) => isClassToday(c, today));

  const todaysSchedule = classesToday
    .map((c) => ({
      schoolClass: c,
      activeCount: students.filter((s) => s.classId === c.id && s.status === '재원').length,
    }))
    .sort((a, b) => (a.schoolClass.time ?? '').localeCompare(b.schoolClass.time ?? ''));

  const pendingFeedbackCount = evaluations.filter(
    (e) => e.writing.imageDataUrl && e.writing.domainScores.length === 0,
  ).length;

  const uncheckedAttendanceCount = classesToday.reduce((sum, c) => {
    const roster = students.filter((s) => s.classId === c.id && s.status === '재원');
    const unchecked = roster.filter((s) => !s.attendanceHistory.some((r) => r.date === todayDate)).length;
    return sum + unchecked;
  }, 0);

  const unansweredCount = notifications.filter((n) => !n.answered).length;

  const tasks = [
    { label: '첨삭 대기', count: pendingFeedbackCount, to: '/evaluations', icon: ClipboardCheckIcon },
    { label: '오늘 출결 미입력', count: uncheckedAttendanceCount, to: '/attendance', icon: CalendarCheckIcon },
    { label: '학부모 미답변 메시지', count: unansweredCount, to: '/communication', icon: ChatIcon },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">대시보드</h1>
      <p className="mt-1 text-sm text-slate-500">오늘도 좋은 수업 되세요.</p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">오늘의 수업 일정</h2>
          <span className="text-xs text-slate-400">
            {todayDate} {WEEKDAY_FULL_LABEL[todayWeekday(today)]}
          </span>
        </div>
        {todaysSchedule.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">오늘은 예정된 수업이 없어요.</p>
        ) : (
          <ul className="mt-3 flex flex-col divide-y divide-slate-100">
            {todaysSchedule.map(({ schoolClass, activeCount: classActiveCount }) => (
              <li key={schoolClass.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="w-20 shrink-0 text-sm font-medium text-slate-900">{schoolClass.time ?? '시간 미정'}</span>
                  <Link to={`/curriculum/classes/${schoolClass.id}`} className="text-sm font-medium text-slate-800 hover:text-brand-600">
                    {schoolClass.name}
                  </Link>
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                      schoolClass.location === '온라인' ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {schoolClass.location}
                  </span>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-sm text-slate-600">
                  <UsersIcon className="h-3.5 w-3.5 text-slate-400" />
                  {classActiveCount}명
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-900">미처리 업무 알림</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {tasks.map((t) => (
            <li key={t.label}>
              <Link
                to={t.to}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3.5 py-2.5 transition-colors hover:bg-slate-50"
              >
                <span className="flex items-center gap-2 text-sm text-slate-700">
                  <t.icon className="h-4 w-4 text-slate-400" />
                  {t.label}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    t.count > 0 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {t.count}건
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <h2 className="text-base font-semibold text-slate-900">담당 학생 현황</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-500">
          이번 달 신규 등록 {newThisMonth}명 · 이번 달 퇴원 {withdrawnThisMonth}명
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
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
                  {c.time && <p className="text-xs text-slate-500">{c.time}</p>}
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
