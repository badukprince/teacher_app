import { ProgressBar } from '../../../components/ProgressBar';
import { formatClassSchedule } from '../../../lib/classSchedule';
import type { SchoolClass } from '../../../types/student';

export function ParentCurriculumTab({ schoolClass }: { schoolClass: SchoolClass | null }) {
  if (!schoolClass) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        배정된 반이 없어요.
      </div>
    );
  }

  const completedCount = schoolClass.sessions.filter((s) => s.completed).length;

  return (
    <div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">{schoolClass.name}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {formatClassSchedule(schoolClass)} · {schoolClass.location}
            </p>
          </div>
          <span className="text-sm font-semibold text-slate-900">
            {schoolClass.sessions.length === 0 ? '-' : `${Math.round((completedCount / schoolClass.sessions.length) * 100)}%`}
          </span>
        </div>
        <div className="mt-3">
          <ProgressBar completed={completedCount} total={schoolClass.sessions.length} showLabel={false} />
        </div>
      </div>

      {schoolClass.sessions.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          등록된 차시가 없어요.
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {schoolClass.sessions.map((session, index) => (
            <li
              key={session.id}
              className={`rounded-xl border p-4 ${session.completed ? 'border-slate-200 bg-white' : 'border-brand-200 bg-brand-50/40'}`}
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">{index + 1}차시</span>
                {session.date && <span className="text-xs text-slate-500">{session.date}</span>}
                {!session.completed && (
                  <span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700">예정</span>
                )}
              </div>
              <p className={`mt-1.5 text-sm font-medium ${session.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                {session.topic}
              </p>
              {session.summary && <p className="mt-1.5 text-sm text-slate-600">{session.summary}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
