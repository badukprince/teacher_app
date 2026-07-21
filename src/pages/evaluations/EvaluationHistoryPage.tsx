import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../../store/AppDataContext';
import { RadarChart } from '../../components/RadarChart';
import { buildGrowthComment, evaluationScores, overallScore } from '../../lib/evaluationConfig';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '../../components/icons';
import { StatusBadge } from '../../components/StatusBadge';

export function EvaluationHistoryPage() {
  const { studentId } = useParams();
  const { getStudent, getClass, getEvaluationsForStudent, deleteEvaluation } = useAppData();
  const navigate = useNavigate();

  const student = studentId ? getStudent(studentId) : undefined;

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
        <p className="text-sm font-medium text-slate-700">학생을 찾을 수 없어요</p>
        <Link to="/evaluations" className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700">
          평가 대상 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const evals = getEvaluationsForStudent(student.id);
  const latest = evals[evals.length - 1];
  const previous = evals.length > 1 ? evals[evals.length - 2] : null;
  const growth = latest ? buildGrowthComment(latest, previous) : null;

  const handleDelete = (id: string, date: string) => {
    if (window.confirm(`${date} 평가 기록을 삭제할까요?`)) {
      deleteEvaluation(id);
    }
  };

  return (
    <div>
      <Link to="/evaluations" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeftIcon className="h-4 w-4" />
        평가 대상 목록
      </Link>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">{student.name}</h1>
            <StatusBadge status={student.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {student.grade} · {student.school} · {getClass(student.classId)?.name ?? '미배정'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/evaluations/${student.id}/new`)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          <PlusIcon className="h-4 w-4" />
          새 평가 작성
        </button>
      </div>

      {latest ? (
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">최근 평가 ({latest.date})</p>
            <div className="mt-2">
              <RadarChart current={evaluationScores(latest) as Record<string, number>} previous={previous ? (evaluationScores(previous) as Record<string, number>) : null} />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-5">
              <p className="text-sm font-semibold text-brand-800">성장 추이</p>
              {growth && (
                <>
                  <p className="mt-1 text-sm text-brand-700">{growth.headline}</p>
                  <p className="mt-1 text-sm text-brand-700">{growth.detail}</p>
                </>
              )}
            </div>
            <Link
              to={`/evaluations/${student.id}/${latest.id}`}
              className="rounded-xl border border-slate-200 bg-white p-5 text-sm font-medium text-brand-600 hover:border-brand-300"
            >
              최근 평가 상세 결과 보기 →
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-sm font-medium text-slate-700">아직 평가 기록이 없어요</p>
          <p className="mt-1 text-sm text-slate-500">새 평가 작성 버튼을 눌러 첫 평가를 입력해보세요.</p>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-base font-semibold text-slate-900">평가 이력</h2>
        {evals.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">평가 이력이 없어요.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {[...evals].reverse().map((evaluation) => {
              const score = overallScore(evaluation);
              return (
                <li
                  key={evaluation.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
                >
                  <Link to={`/evaluations/${student.id}/${evaluation.id}`} className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{evaluation.date}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {evaluation.writing.aiAnalyzed ? 'AI 분석 완료' : '쓰기 분석 미완료'}
                    </p>
                  </Link>
                  <div className="flex items-center gap-3">
                    {score !== null && <span className="text-sm font-semibold text-brand-700">{score}점</span>}
                    <button
                      type="button"
                      onClick={() => handleDelete(evaluation.id, evaluation.date)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                      aria-label="삭제"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
