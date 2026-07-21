import { useState, type FormEvent } from 'react';
import { useAppData } from '../../../store/AppDataContext';
import { inputClass, labelClass } from '../../../lib/formStyles';
import { TrashIcon } from '../../../components/icons';
import type { Student } from '../../../types/student';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function FeedbackHistoryTab({ student }: { student: Student }) {
  const { addFeedbackRecord, removeFeedbackRecord } = useAppData();
  const [date, setDate] = useState(todayISO());
  const [title, setTitle] = useState('');
  const [score, setScore] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addFeedbackRecord(student.id, { date, title: title.trim(), content: content.trim(), score: score.trim() || undefined });
    setTitle('');
    setScore('');
    setContent('');
  };

  const sorted = [...student.feedbackHistory].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-slate-900">첨삭 기록 추가</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className={labelClass}>날짜</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>글 제목</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 독서감상문 - 완득이" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>평가/점수</label>
            <input value={score} onChange={(e) => setScore(e.target.value)} placeholder="예: A+" className={inputClass} />
          </div>
          <div className="sm:col-span-3">
            <label className={labelClass}>첨삭 코멘트</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={2} placeholder="첨삭 내용을 입력하세요" className={inputClass} />
          </div>
        </div>
        <button
          type="submit"
          className="mt-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          disabled={!title.trim()}
        >
          추가
        </button>
      </form>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          아직 첨삭 이력이 없어요.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {sorted.map((r) => (
            <li key={r.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900">{r.title}</p>
                    {r.score && (
                      <span className="rounded bg-brand-50 px-1.5 py-0.5 text-xs font-medium text-brand-700">{r.score}</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{r.date}</p>
                  {r.content && <p className="mt-2 text-sm text-slate-600">{r.content}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => window.confirm('이 기록을 삭제할까요?') && removeFeedbackRecord(student.id, r.id)}
                  className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                  aria-label="삭제"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
