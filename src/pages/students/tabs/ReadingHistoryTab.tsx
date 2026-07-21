import { useState, type FormEvent } from 'react';
import { useAppData } from '../../../store/AppDataContext';
import { inputClass, labelClass } from '../../../lib/formStyles';
import { TrashIcon } from '../../../components/icons';
import type { Student } from '../../../types/student';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function ReadingHistoryTab({ student }: { student: Student }) {
  const { addReadingRecord, removeReadingRecord } = useAppData();
  const [date, setDate] = useState(todayISO());
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [memo, setMemo] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addReadingRecord(student.id, { date, title: title.trim(), author: author.trim(), memo: memo.trim() });
    setTitle('');
    setAuthor('');
    setMemo('');
  };

  const sorted = [...student.readingHistory].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-slate-900">독서 기록 추가</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className={labelClass}>날짜</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>도서명</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 마당을 나온 암탉" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>저자</label>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="예: 황선미" className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>메모</label>
            <input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="독서 태도, 이해도 등" className={inputClass} />
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
          아직 독서 이력이 없어요.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {sorted.map((r) => (
            <li key={r.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{r.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{r.author && `${r.author} · `}{r.date}</p>
                  {r.memo && <p className="mt-2 text-sm text-slate-600">{r.memo}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => window.confirm('이 기록을 삭제할까요?') && removeReadingRecord(student.id, r.id)}
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
