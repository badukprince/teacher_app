import type { Student } from '../../../types/student';

export function ParentReadingFeedbackTab({ student }: { student: Student }) {
  const readingSorted = [...student.readingHistory].sort((a, b) => b.date.localeCompare(a.date));
  const feedbackSorted = [...student.feedbackHistory].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">독서 이력</h2>
        {readingSorted.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">아직 독서 이력이 없어요.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {readingSorted.map((r) => (
              <li key={r.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-900">{r.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {r.author && `${r.author} · `}
                  {r.date}
                </p>
                {r.memo && <p className="mt-2 text-sm text-slate-600">{r.memo}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-900">첨삭 이력</h2>
        {feedbackSorted.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">아직 첨삭 이력이 없어요.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {feedbackSorted.map((r) => (
              <li key={r.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-900">{r.title}</p>
                  {r.score && <span className="rounded bg-brand-50 px-1.5 py-0.5 text-xs font-medium text-brand-700">{r.score}</span>}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{r.date}</p>
                {r.content && <p className="mt-2 text-sm text-slate-600">{r.content}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
