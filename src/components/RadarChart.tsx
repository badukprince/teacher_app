import { SUBJECTS, type Subject } from '../types/evaluation';

interface RadarChartProps {
  current: Partial<Record<Subject, number>>;
  previous?: Partial<Record<Subject, number>> | null;
  size?: number;
}

const LEVELS = [20, 40, 60, 80, 100];
const COLOR_CURRENT = '#2e50e0';
const COLOR_PREVIOUS = '#94a3b8';
const COLOR_GRID = '#e2e8f0';
const COLOR_LABEL = '#64748b';

function vertex(index: number, radiusFraction: number, cx: number, cy: number, radius: number) {
  const angle = (-90 + index * (360 / SUBJECTS.length)) * (Math.PI / 180);
  return {
    x: cx + radius * radiusFraction * Math.cos(angle),
    y: cy + radius * radiusFraction * Math.sin(angle),
    cos: Math.cos(angle),
    sin: Math.sin(angle),
  };
}

export function RadarChart({ current, previous, size = 280 }: RadarChartProps) {
  const padding = 34;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - padding;

  const gridPolygons = LEVELS.map((level) =>
    SUBJECTS.map((_, i) => {
      const v = vertex(i, level / 100, cx, cy, radius);
      return `${v.x},${v.y}`;
    }).join(' '),
  );

  const spokes = SUBJECTS.map((_, i) => vertex(i, 1, cx, cy, radius));

  const toPolygon = (values: Partial<Record<Subject, number>>) =>
    SUBJECTS.map((subject, i) => {
      const v = vertex(i, (values[subject] ?? 0) / 100, cx, cy, radius);
      return `${v.x},${v.y}`;
    }).join(' ');

  const currentPoints = SUBJECTS.map((subject, i) => ({
    subject,
    value: current[subject] ?? 0,
    ...vertex(i, (current[subject] ?? 0) / 100, cx, cy, radius),
  }));

  const showPrevious = Boolean(previous);

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="평가 결과 레이더 차트"
        className="print:h-[190px] print:w-[190px]"
      >
        {gridPolygons.map((points, i) => (
          <polygon key={i} points={points} fill="none" stroke={COLOR_GRID} strokeWidth={1} />
        ))}
        {spokes.map((v, i) => (
          <line key={i} x1={cx} y1={cy} x2={v.x} y2={v.y} stroke={COLOR_GRID} strokeWidth={1} />
        ))}

        {showPrevious && (
          <polygon
            points={toPolygon(previous ?? {})}
            fill="none"
            stroke={COLOR_PREVIOUS}
            strokeWidth={2}
            strokeDasharray="4 3"
            strokeLinejoin="round"
          />
        )}

        <polygon
          points={toPolygon(current)}
          fill={COLOR_CURRENT}
          fillOpacity={0.12}
          stroke={COLOR_CURRENT}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {currentPoints.map((p) => (
          <circle key={p.subject} cx={p.x} cy={p.y} r={4} fill={COLOR_CURRENT} stroke="#ffffff" strokeWidth={2}>
            <title>{`${p.subject}: ${p.value}점`}</title>
          </circle>
        ))}

        {SUBJECTS.map((subject, i) => {
          const v = vertex(i, 1, cx, cy, radius);
          const labelRadius = radius + 18;
          const lx = cx + labelRadius * v.cos;
          const ly = cy + labelRadius * v.sin;
          const anchor = v.cos > 0.15 ? 'start' : v.cos < -0.15 ? 'end' : 'middle';
          const dy = v.sin < -0.3 ? -4 : v.sin > 0.3 ? 14 : 5;
          return (
            <text
              key={subject}
              x={lx}
              y={ly + dy}
              textAnchor={anchor}
              fontSize={12}
              fill={COLOR_LABEL}
              fontWeight={500}
            >
              {subject}
            </text>
          );
        })}
      </svg>

      {showPrevious && (
        <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded-full" style={{ backgroundColor: COLOR_CURRENT }} />
            이번 평가
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-0 w-4 border-t-2 border-dashed"
              style={{ borderColor: COLOR_PREVIOUS }}
            />
            지난 평가
          </span>
        </div>
      )}
    </div>
  );
}
