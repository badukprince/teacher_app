import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../store/AppDataContext';
import { CONSULTATION_TYPE_OPTIONS } from '../../lib/constants';
import { inputClass, labelClass } from '../../lib/formStyles';
import { CommunicationTabs } from './CommunicationTabs';
import { CalendarCheckIcon } from '../../components/icons';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function ConsultationLogPage() {
  const { students, getClass, addConsultationRecord } = useAppData();
  const sortedStudents = useMemo(() => [...students].sort((a, b) => a.name.localeCompare(b.name, 'ko')), [students]);

  const [studentId, setStudentId] = useState(sortedStudents[0]?.id ?? '');
  const [date, setDate] = useState(todayISO());
  const [type, setType] = useState<string>(CONSULTATION_TYPE_OPTIONS[0]);
  const [content, setContent] = useState('');
  const [nextConsultationDate, setNextConsultationDate] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!studentId || !content.trim()) return;
    addConsultationRecord(studentId, {
      date,
      type,
      content: content.trim(),
      nextConsultationDate: nextConsultationDate || undefined,
    });
    setContent('');
    setNextConsultationDate('');
  };

  const upcoming = useMemo(() => {
    const today = todayISO();
    return students
      .flatMap((s) =>
        s.consultationHistory
          .filter((r) => r.nextConsultationDate)
          .map((r) => ({ student: s, record: r })),
      )
      .filter(({ record }) => (record.nextConsultationDate ?? '') >= today)
      .sort((a, b) => (a.record.nextConsultationDate ?? '').localeCompare(b.record.nextConsultationDate ?? ''));
  }, [students]);

  const allLogs = useMemo(() => {
    return students
      .flatMap((s) => s.consultationHistory.map((r) => ({ student: s, record: r })))
      .sort((a, b) => b.record.date.localeCompare(a.record.date));
  }, [students]);

  return (
    <div>
      <div>
        <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">학부모 소통</h1>
        <p className="mt-1 text-sm text-slate-500">알림을 발송하거나 상담 기록을 관리하세요.</p>
      </div>

      <div className="mt-5">
        <CommunicationTabs />
      </div>

      {upcoming.length > 0 && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-1.5">
            <CalendarCheckIcon className="h-4 w-4 text-amber-700" />
            <p className="text-sm font-semibold text-amber-800">다가오는 상담 예정</p>
          </div>
          <ul className="mt-2 flex flex-col gap-1">
            {upcoming.map(({ student, record }) => (
              <li key={record.id} className="flex items-center justify-between text-sm text-amber-700">
                <Link to={`/students/${student.id}`} className="hover:underline">{student.name}</Link>
                <span>{record.nextConsultationDate}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-slate-900">상담일지 작성</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <label className={labelClass}>학생</label>
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className={inputClass}>
              {sortedStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {getClass(s.classId)?.name ?? '미배정'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>상담일</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>상담 방식</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
              {CONSULTATION_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-3">
            <label className={labelClass}>상담 내용</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} placeholder="상담 내용을 입력하세요" className={inputClass} />
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
        </div>
        <button
          type="submit"
          disabled={!studentId || !content.trim()}
          className="mt-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          저장
        </button>
      </form>

      <div className="mt-6">
        <h2 className="text-base font-semibold text-slate-900">전체 상담 이력</h2>
        {allLogs.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">등록된 상담 기록이 없어요.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {allLogs.map(({ student, record }) => (
              <li key={record.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Link to={`/students/${student.id}`} className="text-sm font-medium text-slate-900 hover:text-brand-600">
                    {student.name}
                  </Link>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">{record.type}</span>
                  <span className="text-xs text-slate-400">{record.date}</span>
                </div>
                <p className="mt-1.5 text-sm text-slate-700">{record.content}</p>
                {record.nextConsultationDate && (
                  <p className="mt-2 inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                    다음 상담 예정일: {record.nextConsultationDate}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
