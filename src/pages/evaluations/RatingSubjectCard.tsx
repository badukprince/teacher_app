import { RATING_LEVELS, type DomainDefinition, type RatingLevel } from '../../types/evaluation';

interface RatingSubjectCardProps {
  subject: string;
  domains: DomainDefinition[];
  values: Record<string, RatingLevel | null>;
  onChange: (domainId: string, rating: RatingLevel) => void;
}

const RATING_STYLE: Record<RatingLevel, string> = {
  상: 'border-emerald-500 bg-emerald-500 text-white',
  중: 'border-amber-500 bg-amber-500 text-white',
  하: 'border-slate-500 bg-slate-500 text-white',
};

export function RatingSubjectCard({ subject, domains, values, onChange }: RatingSubjectCardProps) {
  const totalWeight = domains.reduce((sum, d) => sum + d.weight, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">{subject}</p>
        <span className="text-xs text-slate-400">총 {totalWeight}점</span>
      </div>
      <div className="mt-3 flex flex-col divide-y divide-slate-100">
        {domains.map((domain) => (
          <div key={domain.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-slate-800">{domain.label}</span>
                <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
                  {domain.weight}점
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{domain.description}</p>
              {domain.criteria.length > 0 && (
                <details className="mt-1 group">
                  <summary className="cursor-pointer text-xs font-medium text-brand-600 hover:text-brand-700">
                    세부 기준
                  </summary>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-500">
                    {domain.criteria.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
            <div className="flex shrink-0 gap-1.5">
              {RATING_LEVELS.map((level) => {
                const active = values[domain.id] === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onChange(domain.id, level)}
                    className={`h-8 w-10 rounded-lg border text-sm font-medium transition-colors ${
                      active ? RATING_STYLE[level] : 'border-slate-300 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
