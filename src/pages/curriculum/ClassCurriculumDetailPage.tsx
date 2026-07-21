import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppData } from '../../store/AppDataContext';
import { inputClass, labelClass } from '../../lib/formStyles';
import { ProgressBar } from '../../components/ProgressBar';
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  PlusIcon,
  SparklesIcon,
  TrashIcon,
  UsersIcon,
} from '../../components/icons';
import type { CurriculumSession } from '../../types/curriculum';

interface FormState {
  date: string;
  topic: string;
  textbookId: string;
  summary: string;
}

export function ClassCurriculumDetailPage() {
  const { classId } = useParams();
  const {
    getClass,
    getTextbook,
    students,
    textbooks,
    addSession,
    updateSession,
    toggleSessionCompleted,
    removeSession,
    moveSession,
  } = useAppData();

  const schoolClass = classId ? getClass(classId) : undefined;

  const emptyForm = (): FormState => ({ date: '', topic: '', textbookId: schoolClass?.mainTextbookId ?? '', summary: '' });
  const [formOpen, setFormOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());

  if (!schoolClass) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
        <p className="text-sm font-medium text-slate-700">반을 찾을 수 없어요</p>
        <Link to="/curriculum" className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700">
          반 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const activeStudentCount = students.filter((s) => s.classId === schoolClass.id && s.status === '재원').length;
  const nextSession = schoolClass.sessions.find((s) => !s.completed);
  const nextSessionIndex = nextSession ? schoolClass.sessions.indexOf(nextSession) : -1;
  const completedCount = schoolClass.sessions.filter((s) => s.completed).length;

  const openAddForm = () => {
    setForm(emptyForm());
    setEditingSessionId(null);
    setFormOpen(true);
  };

  const openEditForm = (session: CurriculumSession) => {
    setForm({
      date: session.date ?? '',
      topic: session.topic,
      textbookId: session.textbookId ?? '',
      summary: session.summary,
    });
    setEditingSessionId(session.id);
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.topic.trim()) return;
    const input = {
      date: form.date || undefined,
      topic: form.topic.trim(),
      textbookId: form.textbookId || undefined,
      summary: form.summary.trim(),
    };
    if (editingSessionId) {
      updateSession(schoolClass.id, editingSessionId, input);
    } else {
      addSession(schoolClass.id, input);
    }
    closeForm();
  };

  const handleDelete = (session: CurriculumSession) => {
    if (window.confirm(`${session.topic} 차시를 삭제할까요?`)) {
      removeSession(schoolClass.id, session.id);
    }
  };

  return (
    <div>
      <Link to="/curriculum" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeftIcon className="h-4 w-4" />
        반 목록
      </Link>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">{schoolClass.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
            <span>{schoolClass.schedule ?? '일정 미지정'}</span>
            <span className="inline-flex items-center gap-1">
              <UsersIcon className="h-3.5 w-3.5 text-slate-400" />
              {activeStudentCount}명
            </span>
            <span>
              담당 교재: {schoolClass.mainTextbookId ? getTextbook(schoolClass.mainTextbookId)?.title ?? '-' : '미지정'}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">진도율</p>
          <span className="text-sm font-semibold text-slate-900">
            {schoolClass.sessions.length === 0 ? '-' : `${Math.round((completedCount / schoolClass.sessions.length) * 100)}%`}
          </span>
        </div>
        <div className="mt-2">
          <ProgressBar completed={completedCount} total={schoolClass.sessions.length} showLabel={false} />
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          {schoolClass.sessions.length === 0 ? '등록된 차시가 없어요.' : `${schoolClass.sessions.length}차시 중 ${completedCount}차시 완료`}
        </p>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4">
        <SparklesIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
        <div>
          <p className="text-sm font-semibold text-brand-800">다음 차시 예정</p>
          {nextSession ? (
            <p className="mt-1 text-sm text-brand-700">
              {nextSessionIndex + 1}차시 · {nextSession.topic}
              {nextSession.date && ` · ${nextSession.date}`}
              {nextSession.textbookId && ` · ${getTextbook(nextSession.textbookId)?.title ?? ''}`}
            </p>
          ) : schoolClass.sessions.length === 0 ? (
            <p className="mt-1 text-sm text-brand-700">등록된 차시가 없어요. 차시를 추가해보세요.</p>
          ) : (
            <p className="mt-1 text-sm text-brand-700">모든 차시를 완료했어요. 다음 커리큘럼을 계획해보세요.</p>
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">진도표</h2>
        <button
          type="button"
          onClick={openAddForm}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <PlusIcon className="h-4 w-4" />
          차시 추가
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-slate-900">{editingSessionId ? '차시 수정' : '새 차시 추가'}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className={labelClass}>날짜</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>수업 주제 *</label>
              <input
                value={form.topic}
                onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                placeholder="예: 마당을 나온 암탉 1부 - 자유와 책임"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-3">
              <label className={labelClass}>연결 교재</label>
              <select
                value={form.textbookId}
                onChange={(e) => setForm((f) => ({ ...f, textbookId: e.target.value }))}
                className={inputClass}
              >
                <option value="">미지정</option>
                {textbooks.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className={labelClass}>수업 내용 요약 (쓰기 AI 평가 참고자료)</label>
              <textarea
                value={form.summary}
                onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                rows={3}
                placeholder="이번 차시에서 다룬 교재 내용과 지도 포인트를 요약해주세요. 이후 학생 글쓰기 AI 평가 시 참조 자료로 활용됩니다."
                className={inputClass}
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              {editingSessionId ? '저장' : '추가'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              취소
            </button>
          </div>
        </form>
      )}

      {schoolClass.sessions.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-sm font-medium text-slate-700">등록된 차시가 없어요</p>
          <p className="mt-1 text-sm text-slate-500">차시 추가 버튼을 눌러 진도표를 만들어보세요.</p>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {schoolClass.sessions.map((session, index) => (
            <li
              key={session.id}
              className={`rounded-xl border p-4 ${session.completed ? 'border-slate-200 bg-white' : 'border-brand-200 bg-brand-50/40'}`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={session.completed}
                  onChange={() => toggleSessionCompleted(schoolClass.id, session.id)}
                  className="mt-1 h-4 w-4 shrink-0 accent-brand-600"
                  aria-label={`${session.topic} 완료 여부`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">{index + 1}차시</span>
                    {session.date && <span className="text-xs text-slate-500">{session.date}</span>}
                    {session.textbookId && (
                      <span className="rounded bg-brand-50 px-1.5 py-0.5 text-xs font-medium text-brand-700">
                        {getTextbook(session.textbookId)?.title ?? '알 수 없는 교재'}
                      </span>
                    )}
                    {!session.completed && (
                      <span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700">예정</span>
                    )}
                  </div>
                  <p className={`mt-1.5 text-sm font-medium ${session.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                    {session.topic}
                  </p>
                  {session.summary && <p className="mt-1.5 text-sm text-slate-600">{session.summary}</p>}
                </div>
                <div className="flex shrink-0 flex-col items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveSession(schoolClass.id, session.id, 'up')}
                    disabled={index === 0}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                    aria-label="위로 이동"
                  >
                    <ChevronUpIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSession(schoolClass.id, session.id, 'down')}
                    disabled={index === schoolClass.sessions.length - 1}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                    aria-label="아래로 이동"
                  >
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => openEditForm(session)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label="수정"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(session)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                    aria-label="삭제"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
