import { useState } from 'react';
import { EvaluationResultView } from '../../../components/EvaluationResultView';
import { overallScore } from '../../../lib/evaluationConfig';
import { ArrowLeftIcon } from '../../../components/icons';
import type { Evaluation } from '../../../types/evaluation';

export function ParentEvaluationTab({ evaluations }: { evaluations: Evaluation[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const sorted = [...evaluations].sort((a, b) => a.date.localeCompare(b.date));

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        아직 평가 기록이 없어요.
      </div>
    );
  }

  const selectedIndex = sorted.findIndex((e) => e.id === selectedId);
  const selected = selectedIndex >= 0 ? sorted[selectedIndex] : null;

  if (selected) {
    const previous = selectedIndex > 0 ? sorted[selectedIndex - 1] : null;
    return (
      <div>
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          평가 목록
        </button>
        <p className="mt-3 text-sm font-semibold text-slate-900">{selected.date} 평가</p>
        <div className="mt-3">
          <EvaluationResultView evaluation={selected} previous={previous} />
        </div>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {[...sorted].reverse().map((evaluation) => {
        const score = overallScore(evaluation);
        return (
          <li key={evaluation.id}>
            <button
              type="button"
              onClick={() => setSelectedId(evaluation.id)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-brand-300"
            >
              <span className="text-sm font-medium text-slate-900">{evaluation.date}</span>
              {score !== null && <span className="text-sm font-semibold text-brand-700">{score}점</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
