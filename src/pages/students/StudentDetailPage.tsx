import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../../store/AppDataContext';
import { StatusToggle } from '../../components/StatusToggle';
import { ArrowLeftIcon, PencilIcon, TrashIcon } from '../../components/icons';
import type { StudentStatus } from '../../types/student';
import { BasicInfoTab } from './tabs/BasicInfoTab';
import { ParentContactsTab } from './tabs/ParentContactsTab';
import { ReadingHistoryTab } from './tabs/ReadingHistoryTab';
import { FeedbackHistoryTab } from './tabs/FeedbackHistoryTab';
import { AttendanceHistoryTab } from './tabs/AttendanceHistoryTab';
import { ConsultationHistoryTab } from './tabs/ConsultationHistoryTab';

const TABS = ['기본정보', '학부모 연락처', '독서 이력', '첨삭 이력', '출결 이력', '상담 기록'] as const;
type Tab = (typeof TABS)[number];

export function StudentDetailPage() {
  const { studentId } = useParams();
  const { getStudent, getClass, deleteStudent, updateStudent } = useAppData();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('기본정보');

  const student = studentId ? getStudent(studentId) : undefined;

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
        <p className="text-sm font-medium text-slate-700">학생을 찾을 수 없어요</p>
        <Link to="/students" className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700">
          학생 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const schoolClass = getClass(student.classId);

  const handleDelete = () => {
    if (window.confirm(`${student.name} 학생을 삭제할까요? 이 작업은 되돌릴 수 없습니다.`)) {
      deleteStudent(student.id);
      navigate('/students');
    }
  };

  const handleStatusChange = (status: StudentStatus) => {
    updateStudent(student.id, {
      name: student.name,
      grade: student.grade,
      school: student.school,
      classId: student.classId,
      status,
      phone: student.phone,
      parentContacts: student.parentContacts,
      note: student.note,
    });
  };

  return (
    <div>
      <Link to="/students" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeftIcon className="h-4 w-4" />
        학생 목록
      </Link>

      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">{student.name}</h1>
            <StatusToggle status={student.status} onChange={handleStatusChange} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {student.grade} · {student.school} · {schoolClass?.name ?? '미배정'}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            to={`/students/${student.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <PencilIcon className="h-4 w-4" />
            수정
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4" />
            삭제
          </button>
        </div>
      </div>

      <div className="mt-6 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-1 border-b border-slate-200">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`shrink-0 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${
                tab === t
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        {tab === '기본정보' && <BasicInfoTab student={student} schoolClass={schoolClass} />}
        {tab === '학부모 연락처' && <ParentContactsTab student={student} />}
        {tab === '독서 이력' && <ReadingHistoryTab student={student} />}
        {tab === '첨삭 이력' && <FeedbackHistoryTab student={student} />}
        {tab === '출결 이력' && <AttendanceHistoryTab student={student} />}
        {tab === '상담 기록' && <ConsultationHistoryTab student={student} />}
      </div>
    </div>
  );
}
