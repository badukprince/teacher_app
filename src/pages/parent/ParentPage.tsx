import { useState } from 'react';
import { useParentData } from '../../store/ParentDataContext';
import { ParentCurriculumTab } from './tabs/ParentCurriculumTab';
import { ParentAttendanceTab } from './tabs/ParentAttendanceTab';
import { ParentEvaluationTab } from './tabs/ParentEvaluationTab';
import { ParentReadingFeedbackTab } from './tabs/ParentReadingFeedbackTab';

const TABS = ['커리큘럼', '출결', '평가', '독서·첨삭'] as const;
type Tab = (typeof TABS)[number];

export function ParentPage() {
  const { student, schoolClass, evaluations, textbooks, loading, error } = useParentData();
  const [tab, setTab] = useState<Tab>('커리큘럼');

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
        <p className="text-sm font-medium text-slate-700">{error ?? '학생 정보를 찾을 수 없어요'}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">{student.name} 학생</h1>
      <p className="mt-1 text-sm text-slate-500">
        {student.grade} · {student.school}
        {schoolClass ? ` · ${schoolClass.name}` : ''}
      </p>

      <div className="mt-5 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-1 border-b border-slate-200">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`shrink-0 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${
                tab === t ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        {tab === '커리큘럼' && <ParentCurriculumTab schoolClass={schoolClass} textbooks={textbooks} />}
        {tab === '출결' && <ParentAttendanceTab student={student} />}
        {tab === '평가' && <ParentEvaluationTab evaluations={evaluations} />}
        {tab === '독서·첨삭' && <ParentReadingFeedbackTab student={student} />}
      </div>
    </div>
  );
}
