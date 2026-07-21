import { RadarChart } from './RadarChart';
import { SUBJECT_DOMAINS, buildGrowthComment, domainScoreForRating, evaluationScores } from '../lib/evaluationConfig';
import type { Evaluation, RatingLevel } from '../types/evaluation';

const RATING_STYLE: Record<RatingLevel, string> = {
  상: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  중: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  하: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};

interface EvaluationResultViewProps {
  evaluation: Evaluation;
  previous: Evaluation | null;
}

export function EvaluationResultView({ evaluation, previous }: EvaluationResultViewProps) {
  const growth = buildGrowthComment(evaluation, previous);

  const ratedSection = (label: string, results: typeof evaluation.listening, subjectKey: keyof typeof SUBJECT_DOMAINS) => {
    const domains = SUBJECT_DOMAINS[subjectKey];
    const total = results.reduce((sum, r) => {
      const domain = domains.find((d) => d.id === r.domainId);
      return sum + domainScoreForRating(r.rating, domain?.weight ?? 0);
    }, 0);
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 print:break-inside-avoid print:p-2.5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900 print:text-xs">{label}</p>
          <span className="text-xs font-medium text-slate-500 print:text-[10px]">{total}/100점</span>
        </div>
        <ul className="mt-3 flex flex-col gap-2 print:mt-1.5 print:gap-1">
          {results.map((r) => {
            const domain = domains.find((d) => d.id === r.domainId);
            return (
              <li key={r.domainId} className="flex items-center justify-between gap-2 text-sm print:text-xs">
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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 print:grid-cols-2 print:gap-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 print:break-inside-avoid print:p-2">
          <RadarChart
            current={evaluationScores(evaluation) as Record<string, number>}
            previous={previous ? (evaluationScores(previous) as Record<string, number>) : null}
          />
        </div>
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 print:break-inside-avoid print:border-slate-200 print:bg-white print:p-2.5">
          <p className="text-sm font-semibold text-brand-800 print:text-xs">성장 추이 코멘트</p>
          <p className="mt-1 text-sm text-brand-700 print:text-xs">{growth.headline}</p>
          <p className="mt-1 text-sm text-brand-700 print:text-xs">{growth.detail}</p>
          {previous && <p className="mt-3 text-xs text-brand-600 print:mt-1.5 print:text-[10px]">비교 대상: {previous.date} 평가</p>}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 print:mt-2 print:grid-cols-2 print:gap-2">
        {ratedSection('듣기', evaluation.listening, '듣기')}
        {ratedSection('읽기', evaluation.reading, '읽기')}
        {ratedSection('말하기', evaluation.speaking, '말하기')}
        {ratedSection('생각하기', evaluation.thinking, '생각하기')}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 print:mt-2 print:break-inside-avoid print:p-2.5">
        <p className="text-sm font-semibold text-slate-900 print:text-xs">쓰기 평가</p>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 print:mt-1.5 print:grid-cols-2 print:gap-2">
          <div>
            <p className="text-xs font-medium text-slate-500 print:text-[10px]">학생 제출 원문</p>
            {evaluation.writing.imageDataUrl ? (
              <div className="mt-1.5 overflow-hidden rounded-lg border border-slate-200 print:mt-1">
                <img
                  src={evaluation.writing.imageDataUrl}
                  alt="학생 제출 원문"
                  className="max-h-96 w-full object-contain bg-slate-50 print:max-h-[220px]"
                />
              </div>
            ) : (
              <p className="mt-1.5 text-sm text-slate-400 print:text-xs">업로드된 이미지가 없어요.</p>
            )}
          </div>
          <div className="flex flex-col gap-4 print:gap-2">
            <div>
              <p className="text-xs font-medium text-slate-500 print:text-[10px]">영역별 점수</p>
              <ul className="mt-1.5 flex flex-col gap-1.5 print:mt-1 print:gap-1">
                {evaluation.writing.domainScores.map((s) => {
                  const domain = SUBJECT_DOMAINS.쓰기.find((d) => d.id === s.domainId);
                  return (
                    <li key={s.domainId} className="flex items-center justify-between text-sm print:text-xs">
                      <span className="text-slate-600">{domain?.label ?? s.domainId}</span>
                      <span className="font-medium text-slate-900">{s.score}/{domain?.weight ?? 0}점</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 print:text-[10px]">총평 코멘트</p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-700 print:mt-1 print:text-xs">{evaluation.writing.overallComment || '-'}</p>
            </div>
            {evaluation.writing.paragraphFeedback.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 print:text-[10px]">문단별 피드백</p>
                <ul className="mt-1.5 flex flex-col gap-2 print:mt-1 print:gap-1">
                  {evaluation.writing.paragraphFeedback.map((p) => (
                    <li key={p.id} className="rounded-lg bg-slate-50 p-2.5 text-sm print:p-1.5 print:text-xs">
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
