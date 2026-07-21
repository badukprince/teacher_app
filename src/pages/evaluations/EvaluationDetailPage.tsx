import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../../store/AppDataContext';
import { RadarChart } from '../../components/RadarChart';
import { SUBJECT_DOMAINS, buildGrowthComment, domainScoreForRating, evaluationScores, overallScore } from '../../lib/evaluationConfig';
import { ArrowLeftIcon, PencilIcon, TrashIcon } from '../../components/icons';
import type { RatingLevel } from '../../types/evaluation';

const RATING_STYLE: Record<RatingLevel, string> = {
  상: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  중: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  하: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};

export function EvaluationDetailPage() {
  const { studentId, evaluationId } = useParams();
  const { getStudent, getEvaluation, getEvaluationsForStudent, deleteEvaluation } = useAppData();
  const navigate = useNavigate();

  const student = studentId ? getStudent(studentId) : undefined;
  const evaluation = evaluationId ? getEvaluation(evaluationId) : undefined;

  if (!student || !evaluation || evaluation.studentId !== student.id) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
        <p className="text-sm font-medium text-slate-700">평가 기록을 찾을 수 없어요</p>
        <Link to="/evaluations" className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700">
          평가 대상 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const history = getEvaluationsForStudent(student.id);
  const index = history.findIndex((e) => e.id === evaluation.id);
  const previous = index > 0 ? history[index - 1] : null;
  const growth = buildGrowthComment(evaluation, previous);
  const score = overallScore(evaluation);

  const handleDelete = () => {
    if (window.confirm(`${evaluation.date} 평가 기록을 삭제할까요?`)) {
      deleteEvaluation(evaluation.id);
      navigate(`/evaluations/${student.id}`);
    }
  };

  const ratedSection = (label: string, results: typeof evaluation.listening, subjectKey: keyof typeof SUBJECT_DOMAINS) => {
    const domains = SUBJECT_DOMAINS[subjectKey];
    const total = results.reduce((sum, r) => {
      const domain = domains.find((d) => d.id === r.domainId);
      return sum + domainScoreForRating(r.rating, domain?.weight ?? 0);
    }, 0);
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <span className="text-xs font-medium text-slate-500">{total}/100점</span>
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {results.map((r) => {
            const domain = domains.find((d) => d.id === r.domainId);
            return (
              <li key={r.domainId} className="flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 truncate text-slate-600">{domain?.label ?? r.domainId}</span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <span className="text-xs text-slate-400">{domainScoreForRating(r.rating, domain?.weight ?? 0)}/{domain?.weight ?? 0}점</span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${RATING_STYLE[r.rating]}`}>
                    {r.rating}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div>
      <Link to={`/evaluations/${student.id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeftIcon className="h-4 w-4" />
        평가 이력
      </Link>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">{student.name} · {evaluation.date} 평가</h1>
          {score !== null && <p className="mt-1 text-sm text-slate-500">종합 점수 {score}점</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            to={`/evaluations/${student.id}/${evaluation.id}/edit`}
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

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <RadarChart
            current={evaluationScores(evaluation) as Record<string, number>}
            previous={previous ? (evaluationScores(previous) as Record<string, number>) : null}
          />
        </div>
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-5">
          <p className="text-sm font-semibold text-brand-800">성장 추이 코멘트</p>
          <p className="mt-1 text-sm text-brand-700">{growth.headline}</p>
          <p className="mt-1 text-sm text-brand-700">{growth.detail}</p>
          {previous && <p className="mt-3 text-xs text-brand-600">비교 대상: {previous.date} 평가</p>}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ratedSection('듣기', evaluation.listening, '듣기')}
        {ratedSection('읽기', evaluation.reading, '읽기')}
        {ratedSection('말하기', evaluation.speaking, '말하기')}
        {ratedSection('생각하기', evaluation.thinking, '생각하기')}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-900">쓰기 평가</p>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-slate-500">학생 제출 원문</p>
            {evaluation.writing.imageDataUrl ? (
              <div className="mt-1.5 overflow-hidden rounded-lg border border-slate-200">
                <img src={evaluation.writing.imageDataUrl} alt="학생 제출 원문" className="max-h-96 w-full object-contain bg-slate-50" />
              </div>
            ) : (
              <p className="mt-1.5 text-sm text-slate-400">업로드된 이미지가 없어요.</p>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500">영역별 점수</p>
              <ul className="mt-1.5 flex flex-col gap-1.5">
                {evaluation.writing.domainScores.map((s) => {
                  const domain = SUBJECT_DOMAINS.쓰기.find((d) => d.id === s.domainId);
                  return (
                    <li key={s.domainId} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{domain?.label ?? s.domainId}</span>
                      <span className="font-medium text-slate-900">{s.score}/{domain?.weight ?? 0}점</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">총평 코멘트</p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-700">{evaluation.writing.overallComment || '-'}</p>
            </div>
            {evaluation.writing.paragraphFeedback.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500">문단별 피드백</p>
                <ul className="mt-1.5 flex flex-col gap-2">
                  {evaluation.writing.paragraphFeedback.map((p) => (
                    <li key={p.id} className="rounded-lg bg-slate-50 p-2.5 text-sm">
                      <span className="mr-1.5 font-medium text-slate-700">{p.paragraphIndex}문단</span>
                      <span className="text-slate-600">{p.comment}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
