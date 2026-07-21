import { useMemo, useState, type FormEvent } from 'react';
import { useAppData } from '../../store/AppDataContext';
import { GRADE_OPTIONS, STAGE_OPTIONS } from '../../lib/constants';
import { inputClass, labelClass } from '../../lib/formStyles';
import { CurriculumTabs } from './CurriculumTabs';
import { PencilIcon, PlusIcon, TrashIcon } from '../../components/icons';
import type { Textbook } from '../../types/curriculum';

interface FormState {
  title: string;
  author: string;
  publisher: string;
  grades: string[];
  stage: string;
  description: string;
}

const EMPTY_FORM: FormState = { title: '', author: '', publisher: '', grades: [], stage: STAGE_OPTIONS[0], description: '' };

export function TextbookLibraryPage() {
  const { textbooks, classes, addTextbook, updateTextbook, deleteTextbook } = useAppData();
  const [gradeFilter, setGradeFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const filtered = useMemo(() => {
    return textbooks
      .filter((t) => gradeFilter === 'all' || t.grades.includes(gradeFilter))
      .filter((t) => stageFilter === 'all' || t.stage === stageFilter)
      .sort((a, b) => a.title.localeCompare(b.title, 'ko'));
  }, [textbooks, gradeFilter, stageFilter]);

  const referencedCount = (textbookId: string) =>
    classes.filter((c) => c.mainTextbookId === textbookId || c.sessions.some((s) => s.textbookId === textbookId)).length;

  const openCreateForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEditForm = (t: Textbook) => {
    setForm({
      title: t.title,
      author: t.author ?? '',
      publisher: t.publisher ?? '',
      grades: t.grades,
      stage: t.stage ?? STAGE_OPTIONS[0],
      description: t.description ?? '',
    });
    setEditingId(t.id);
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const toggleGrade = (grade: string) => {
    setForm((f) => ({
      ...f,
      grades: f.grades.includes(grade) ? f.grades.filter((g) => g !== grade) : [...f.grades, grade],
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const input = {
      title: form.title.trim(),
      author: form.author.trim() || undefined,
      publisher: form.publisher.trim() || undefined,
      grades: form.grades,
      stage: form.stage || undefined,
      description: form.description.trim() || undefined,
    };
    if (editingId) {
      updateTextbook(editingId, input);
    } else {
      addTextbook(input);
    }
    closeForm();
  };

  const handleDelete = (t: Textbook) => {
    const count = referencedCount(t.id);
    const message =
      count > 0
        ? `${t.title}을(를) 삭제할까요? 이 교재를 참조하는 반/차시 ${count}건에서 연결이 해제돼요.`
        : `${t.title}을(를) 삭제할까요?`;
    if (window.confirm(message)) {
      deleteTextbook(t.id);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">수업/커리큘럼</h1>
          <p className="mt-1 text-sm text-slate-500">전체 {textbooks.length}종 교재</p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          <PlusIcon className="h-4 w-4" />
          새 교재 추가
        </button>
      </div>

      <div className="mt-5">
        <CurriculumTabs />
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
          <p className="mb-3 text-sm font-semibold text-slate-900">{editingId ? '교재 정보 수정' : '새 교재 추가'}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>교재명 *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="예: 마당을 나온 암탉 독서논술"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>단계</label>
              <select value={form.stage} onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value }))} className={inputClass}>
                {STAGE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>저자</label>
              <input value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>출판사</label>
              <input value={form.publisher} onChange={(e) => setForm((f) => ({ ...f, publisher: e.target.value }))} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>추천 학년</label>
              <div className="flex flex-wrap gap-1.5">
                {GRADE_OPTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGrade(g)}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                      form.grades.includes(g)
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>설명</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                placeholder="교재 소개 및 활용 포인트"
                className={inputClass}
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              {editingId ? '저장' : '추가'}
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

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className={inputClass}>
            <option value="all">전체 학년</option>
            {GRADE_OPTIONS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className={inputClass}>
            <option value="all">전체 단계</option>
            {STAGE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
          <p className="text-sm font-medium text-slate-700">조건에 맞는 교재가 없어요</p>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <li key={t.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {[t.author, t.publisher].filter(Boolean).join(' · ') || '저자/출판사 미등록'}
                  </p>
                </div>
                {t.stage && (
                  <span className="shrink-0 rounded bg-brand-50 px-1.5 py-0.5 text-xs font-medium text-brand-700">{t.stage}</span>
                )}
              </div>
              {t.grades.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {t.grades.map((g) => (
                    <span key={g} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">{g}</span>
                  ))}
                </div>
              )}
              {t.description && <p className="mt-2 line-clamp-3 text-sm text-slate-600">{t.description}</p>}
              <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => openEditForm(t)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  <PencilIcon className="h-3.5 w-3.5" />
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(t)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
