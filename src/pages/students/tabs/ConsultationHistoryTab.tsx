import { useState, type FormEvent } from 'react';
import { useAppData } from '../../../store/AppDataContext';
import { inputClass, labelClass } from '../../../lib/formStyles';
import { CONSULTATION_TYPE_OPTIONS } from '../../../lib/constants';
import { TrashIcon } from '../../../components/icons';
import type { Student } from '../../../types/student';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function ConsultationHistoryTab({ student }: { student: Student }) {
  const { addConsultationRecord, removeConsultationRecord } = useAppData();
  const [date, setDate] = useState(todayISO());
  const [type, setType] = useState<string>(CONSULTATION_TYPE_OPTIONS[0]);
  const [content, setContent] = useState('');
  const [nextConsultationDate, setNextConsultationDate] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addConsultationRecord(student.id, {
      date,
      type,
      content: content.trim(),
      nextConsultationDate: nextConsultationDate || undefined,
    });
    setContent('');
    setNextConsultationDate('');
  };

  const sorted = [...student.consultationHistory].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-slate-900">상담 기록 추가</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className={labelClass}>날짜</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>방식</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
              {CONSULTATION_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>다음 상담 예정일</label>
            <input
              type="date"
              value={nextConsultationDate}
              onChange={(e) => setNextConsultationDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-3">
            <label className={labelClass}>상담 내용</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={2} placeholder="상담 내용을 입력하세요" className={inputClass} />
          </div>
        </div>
        <button
          type="submit"
          className="mt-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          disabled={!content.trim()}
        >
          추가
        </button>
      </form>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          아직 상담 기록이 없어요.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {sorted.map((r) => (
            <li key={r.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">{r.type}</span>
                    <span className="text-xs text-slate-500">{r.date}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{r.content}</p>
                  {r.nextConsultationDate && (
                    <p className="mt-2 inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                      다음 상담 예정일: {r.nextConsultationDate}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => window.confirm('이 기록을 삭제할까요?') && removeConsultationRecord(student.id, r.id)}
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
