import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../../store/AppDataContext';
import { GRADE_OPTIONS, PARENT_RELATION_OPTIONS, STATUS_OPTIONS } from '../../lib/constants';
import { inputClass, labelClass } from '../../lib/formStyles';
import { newId } from '../../lib/storage';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '../../components/icons';
import type { ParentContact, StudentStatus } from '../../types/student';

interface ContactRow extends ParentContact {}

export function StudentFormPage() {
  const { studentId } = useParams();
  const isEdit = Boolean(studentId);
  const { getStudent, classes, addClass, addStudent, updateStudent } = useAppData();
  const navigate = useNavigate();

  const existing = isEdit && studentId ? getStudent(studentId) : undefined;

  if (isEdit && !existing) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
        <p className="text-sm font-medium text-slate-700">학생을 찾을 수 없어요</p>
        <Link to="/students" className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700">
          학생 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const [name, setName] = useState(existing?.name ?? '');
  const [grade, setGrade] = useState(existing?.grade ?? GRADE_OPTIONS[0]);
  const [school, setSchool] = useState(existing?.school ?? '');
  const [classId, setClassId] = useState(existing?.classId ?? classes[0]?.id ?? '');
  const [status, setStatus] = useState<StudentStatus>(existing?.status ?? '재원');
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [note, setNote] = useState(existing?.note ?? '');
  const [contacts, setContacts] = useState<ContactRow[]>(
    existing?.parentContacts.length
      ? existing.parentContacts
      : [{ id: newId(), relation: '모', name: '', phone: '', isPrimary: true }],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showAddClass, setShowAddClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassTime, setNewClassTime] = useState('');

  const updateContact = (id: string, patch: Partial<ContactRow>) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const addContactRow = () => {
    setContacts((prev) => [...prev, { id: newId(), relation: '모', name: '', phone: '', isPrimary: prev.length === 0 }]);
  };

  const removeContactRow = (id: string) => {
    setContacts((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (next.length > 0 && !next.some((c) => c.isPrimary)) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next;
    });
  };

  const setPrimaryContact = (id: string) => {
    setContacts((prev) => prev.map((c) => ({ ...c, isPrimary: c.id === id })));
  };

  const handleAddClass = () => {
    if (!newClassName.trim()) return;
    const created = addClass({
      name: newClassName.trim(),
      daysOfWeek: [],
      time: newClassTime.trim() || undefined,
      location: '오프라인',
    });
    setClassId(created.id);
    setNewClassName('');
    setNewClassTime('');
    setShowAddClass(false);
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = '이름을 입력해주세요.';
    if (!school.trim()) nextErrors.school = '학교를 입력해주세요.';
    if (!classId) nextErrors.classId = '반을 선택해주세요.';

    const filledContacts = contacts.filter((c) => c.name.trim() || c.phone.trim());
    const incomplete = filledContacts.find((c) => !c.name.trim() || !c.phone.trim());
    if (incomplete) {
      nextErrors.contacts = '학부모 연락처는 이름과 전화번호를 모두 입력해주세요.';
    } else if (filledContacts.length === 0) {
      nextErrors.contacts = '학부모 연락처를 최소 1건 입력해주세요.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const cleanedContacts = contacts
      .filter((c) => c.name.trim() && c.phone.trim())
      .map((c) => ({ ...c, name: c.name.trim(), phone: c.phone.trim(), email: c.email?.trim() || undefined }));
    if (!cleanedContacts.some((c) => c.isPrimary) && cleanedContacts.length > 0) {
      cleanedContacts[0].isPrimary = true;
    }

    const input = {
      name: name.trim(),
      grade,
      school: school.trim(),
      classId,
      status,
      phone: phone.trim() || undefined,
      parentContacts: cleanedContacts,
      note: note.trim() || undefined,
    };

    if (isEdit && existing) {
      updateStudent(existing.id, input);
      navigate(`/students/${existing.id}`);
    } else {
      const created = addStudent(input);
      navigate(`/students/${created.id}`);
    }
  };

  return (
    <div>
      <Link
        to={isEdit && existing ? `/students/${existing.id}` : '/students'}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {isEdit ? '학생 상세로' : '학생 목록'}
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-slate-900 md:text-2xl">
        {isEdit ? '학생 정보 수정' : '신규 학생 등록'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">기본 정보</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>이름 *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="학생 이름" />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label className={labelClass}>학년 *</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)} className={inputClass}>
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>학교 *</label>
              <input value={school} onChange={(e) => setSchool(e.target.value)} className={inputClass} placeholder="예: 한빛초등학교" />
              {errors.school && <p className="mt-1 text-xs text-red-600">{errors.school}</p>}
            </div>
            <div>
              <label className={labelClass}>학생 연락처</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="선택 입력" />
            </div>
            <div>
              <label className={labelClass}>반 배정 *</label>
              <select value={classId} onChange={(e) => setClassId(e.target.value)} className={inputClass}>
                {classes.length === 0 && <option value="">등록된 반이 없어요</option>}
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.classId && <p className="mt-1 text-xs text-red-600">{errors.classId}</p>}
              <button
                type="button"
                onClick={() => setShowAddClass((v) => !v)}
                className="mt-1.5 text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                + 새 반 추가
              </button>
              {showAddClass && (
                <div className="mt-2 flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <input
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="반 이름 (예: 금요 초등 C반)"
                    className={inputClass}
                  />
                  <input
                    value={newClassTime}
                    onChange={(e) => setNewClassTime(e.target.value)}
                    placeholder="수업 시간 (선택, 예: 17:00~18:30)"
                    className={inputClass}
                  />
                  <p className="text-xs text-slate-500">요일과 장소는 반 목록에서 나중에 설정할 수 있어요.</p>
                  <button
                    type="button"
                    onClick={handleAddClass}
                    className="self-start rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
                  >
                    반 추가
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className={labelClass}>상태</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as StudentStatus)} className={inputClass}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">학부모 연락처</h2>
            <button
              type="button"
              onClick={addContactRow}
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              연락처 추가
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {contacts.map((c) => (
              <div key={c.id} className="rounded-lg border border-slate-200 p-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[6rem_1fr_1fr] lg:grid-cols-[6rem_1fr_1fr_1fr]">
                  <select
                    value={c.relation}
                    onChange={(e) => updateContact(c.id, { relation: e.target.value })}
                    className={inputClass}
                  >
                    {PARENT_RELATION_OPTIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <input
                    value={c.name}
                    onChange={(e) => updateContact(c.id, { name: e.target.value })}
                    placeholder="보호자 이름"
                    className={inputClass}
                  />
                  <input
                    value={c.phone}
                    onChange={(e) => updateContact(c.id, { phone: e.target.value })}
                    placeholder="010-0000-0000"
                    className={inputClass}
                  />
                  <input
                    type="email"
                    value={c.email ?? ''}
                    onChange={(e) => updateContact(c.id, { email: e.target.value })}
                    placeholder="이메일 (선택)"
                    className={`${inputClass} lg:col-span-1 sm:col-span-2`}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <label className="flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-600">
                    <input
                      type="radio"
                      name="primary-contact"
                      checked={c.isPrimary}
                      onChange={() => setPrimaryContact(c.id)}
                      className="h-3.5 w-3.5"
                    />
                    주 연락처
                  </label>
                  <button
                    type="button"
                    onClick={() => removeContactRow(c.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                    aria-label="연락처 삭제"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {contacts.length === 0 && (
              <p className="text-sm text-slate-500">등록된 연락처가 없어요. 연락처 추가 버튼을 눌러주세요.</p>
            )}
          </div>
          {errors.contacts && <p className="mt-2 text-xs text-red-600">{errors.contacts}</p>}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <label className={labelClass}>특이사항</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="학습 성향, 유의사항 등을 자유롭게 기록하세요"
            className={inputClass}
          />
        </section>

        <div className="flex justify-end gap-2">
          <Link
            to={isEdit && existing ? `/students/${existing.id}` : '/students'}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            취소
          </Link>
          <button type="submit" className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700">
            {isEdit ? '저장' : '등록'}
          </button>
        </div>
      </form>
    </div>
  );
}
