import type { SchoolClass, Student } from '../../../types/student';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{value || '-'}</dd>
    </div>
  );
}

export function BasicInfoTab({ student, schoolClass }: { student: Student; schoolClass?: SchoolClass }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
        <Field label="이름" value={student.name} />
        <Field label="학년" value={student.grade} />
        <Field label="학교" value={student.school} />
        <Field label="반" value={schoolClass?.name ?? '미배정'} />
        <Field label="상태" value={student.status} />
        <Field label="학생 연락처" value={student.phone ?? ''} />
      </dl>
      <div className="mt-5 border-t border-slate-100 pt-5">
        <dt className="text-xs font-medium text-slate-500">특이사항</dt>
        <dd className="mt-1.5 whitespace-pre-wrap text-sm text-slate-700">{student.note || '등록된 특이사항이 없어요.'}</dd>
      </div>
      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1 border-t border-slate-100 pt-4 text-xs text-slate-400">
        <span>등록일 {new Date(student.createdAt).toLocaleDateString('ko-KR')}</span>
        <span>최근 수정일 {new Date(student.updatedAt).toLocaleDateString('ko-KR')}</span>
      </div>
    </div>
  );
}
