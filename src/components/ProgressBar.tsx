interface ProgressBarProps {
  completed: number;
  total: number;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function ProgressBar({ completed, total, size = 'md', showLabel = true }: ProgressBarProps) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const height = size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className="flex items-center gap-2">
      <div className={`min-w-[64px] flex-1 overflow-hidden rounded-full bg-slate-100 ${height}`}>
        <div
          className={`h-full rounded-full transition-[width] ${percent >= 100 ? 'bg-emerald-500' : 'bg-brand-600'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <span className="shrink-0 text-xs font-medium text-slate-500">
          {total === 0 ? '차시 없음' : `${completed}/${total} · ${percent}%`}
        </span>
      )}
    </div>
  );
}
