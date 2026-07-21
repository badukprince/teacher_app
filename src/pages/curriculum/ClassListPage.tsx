import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../store/AppDataContext';
import { inputClass, labelClass } from '../../lib/formStyles';
import { CurriculumTabs } from './CurriculumTabs';
import { ProgressBar } from '../../components/ProgressBar';
import { PencilIcon, PlusIcon, TrashIcon, UsersIcon } from '../../components/icons';
import type { SchoolClass } from '../../types/student';

interface FormState {
  name: string;
  gradeBand: string;
  schedule: string;
  mainTextbookId: string;
}

const EMPTY_FORM: FormState = { name: '', gradeBand: '', schedule: '', mainTextbookId: '' };

export function ClassListPage() {
  const { classes, students, textbooks, getTextbook, addClass, updateClass, deleteClass } = useAppData();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const activeStudentCount = (classId: string) =>
    students.filter((s) => s.classId === classId && s.status === '재원').length;

  const sessionProgress = (c: SchoolClass) => ({
    completed: c.sessions.filter((s) => s.completed).length,
    total: c.sessions.length,
  });

  const openCreateForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEditForm = (c: SchoolClass) => {
    setForm({
      name: c.name,
      gradeBand: c.gradeBand ?? '',
      schedule: c.schedule ?? '',
      mainTextbookId: c.mainTextbookId ?? '',
    });
    setEditingId(c.id);
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const input = {
      name: form.name.trim(),
      gradeBand: form.gradeBand.trim() || undefined,
      schedule: form.schedule.trim() || undefined,
      mainTextbookId: form.mainTextbookId || undefined,
    };
    if (editingId) {
      updateClass(editingId, input);
    } else {
      addClass(input);
    }
    closeForm();
  };

  const handleDelete = (c: SchoolClass) => {
    const count = students.filter((s) => s.classId === c.id).length;
    if (count > 0) {
      window.alert(`이 반에 배정된 학생이 ${count}명 있어 삭제할 수 없어요. 먼저 학생의 반 배정을 변경해주세요.`);
      return;
    }
    if (window.confirm(`${c.name}을(를) 삭제할까요?`)) {
      deleteClass(c.id);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">수업/커리큘럼</h1>
          <p className="mt-1 text-sm text-slate-500">전체 {classes.length}개 반</p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          <PlusIcon className="h-4 w-4" />
          새 반 추가
        </button>
      </div>

      <div className="mt-5">
        <CurriculumTabs />
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
          <p className="mb-3 text-sm font-semibold text-slate-900">{editingId ? '반 정보 수정' : '새 반 추가'}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={labelClass}>반 이름 *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="예: 화목 초등 A반"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>학년대</label>
              <input
                value={form.gradeBand}
                onChange={(e) => setForm((f) => ({ ...f, gradeBand: e.target.value }))}
                placeholder="예: 초3~4"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>요일/시간</label>
              <input
                value={form.schedule}
                onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))}
                placeholder="예: 화, 목 16:00~17:30"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>담당 교재</label>
              <select
                value={form.mainTextbookId}
                onChange={(e) => setForm((f) => ({ ...f, mainTextbookId: e.target.value }))}
                className={inputClass}
              >
                <option value="">미지정</option>
                {textbooks.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
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

      {classes.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
          <p className="text-sm font-medium text-slate-700">등록된 반이 없어요</p>
          <p className="mt-1 text-sm text-slate-500">새 반 추가 버튼을 눌러 반을 만들어보세요.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">반 이름</th>
                  <th className="px-4 py-3 font-medium">요일/시간</th>
                  <th className="px-4 py-3 font-medium">학생 수</th>
                  <th className="px-4 py-3 font-medium">담당 교재</th>
                  <th className="px-4 py-3 font-medium">진도</th>
                  <th className="px-4 py-3 font-medium text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classes.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link to={`/curriculum/classes/${c.id}`} className="font-medium text-slate-900 hover:text-brand-600">
                        {c.name}
                      </Link>
                      {c.gradeBand && <p className="mt-0.5 text-xs text-slate-500">{c.gradeBand}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.schedule ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <UsersIcon className="h-3.5 w-3.5 text-slate-400" />
                        {activeStudentCount(c.id)}명
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.mainTextbookId ? getTextbook(c.mainTextbookId)?.title ?? '-' : '미지정'}</td>
                    <td className="px-4 py-3">
                      <div className="w-36">
                        <ProgressBar {...sessionProgress(c)} size="sm" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditForm(c)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          aria-label="수정"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                          aria-label="삭제"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-6 flex flex-col gap-3 md:hidden">
            {classes.map((c) => (
              <li key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <Link to={`/curriculum/classes/${c.id}`} className="block">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">{c.name}</span>
                    <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                      <UsersIcon className="h-3.5 w-3.5 text-slate-400" />
                      {activeStudentCount(c.id)}명
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{c.schedule ?? '일정 미지정'}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    담당 교재: {c.mainTextbookId ? getTextbook(c.mainTextbookId)?.title ?? '-' : '미지정'}
                  </p>
                  <div className="mt-2">
                    <ProgressBar {...sessionProgress(c)} size="sm" />
                  </div>
                </Link>
                <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => openEditForm(c)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-600"
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-600"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
