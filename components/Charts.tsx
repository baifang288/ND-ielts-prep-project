"use client";

const PALETTE = ["var(--listening)", "var(--writing)", "var(--reading)", "var(--speaking)"];

interface Series {
  name: string;
  values: (number | null)[];
  color?: string;
}

function niceMax(v: number): number {
  if (v <= 0) return 10;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

function Legend({ series }: { series: Series[] }) {
  return (
    <div className="row small" style={{ marginTop: 4 }}>
      {series.map((s, i) => (
        <span key={s.name} className="row" style={{ gap: 4 }}>
          <span aria-hidden style={{ width: 12, height: 12, borderRadius: 3, background: s.color ?? PALETTE[i % PALETTE.length], display: "inline-block" }} />
          {s.name}
        </span>
      ))}
    </div>
  );
}

export function LineChart({ labels, series, unit = "", max, title }: { labels: string[]; series: Series[]; unit?: string; max?: number; title: string }) {
  const W = 560, H = 220, L = 40, R = 12, T = 12, B = 28;
  const all = series.flatMap((s) => s.values.filter((v): v is number => v !== null));
  const top = max ?? niceMax(Math.max(...all, 1));
  const x = (i: number) => L + (labels.length <= 1 ? (W - L - R) / 2 : (i * (W - L - R)) / (labels.length - 1));
  const y = (v: number) => T + (H - T - B) * (1 - v / top);
  const ticks = [0, top / 2, top];
  return (
    <figure style={{ margin: 0 }}>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={title}>
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid-line" x1={L} x2={W - R} y1={y(t)} y2={y(t)} />
            <text x={L - 6} y={y(t) + 4} textAnchor="end">{Math.round(t)}{unit}</text>
          </g>
        ))}
        {labels.map((l, i) => (labels.length <= 8 || i % Math.ceil(labels.length / 8) === 0) && (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle">{l}</text>
        ))}
        {series.map((s, si) => {
          const color = s.color ?? PALETTE[si % PALETTE.length];
          const pts = s.values.map((v, i) => (v === null ? null : [x(i), y(v)] as const)).filter(Boolean) as (readonly [number, number])[];
          return (
            <g key={s.name}>
              {pts.length > 1 && <polyline fill="none" stroke={color} strokeWidth={2.5} points={pts.map((p) => p.join(",")).join(" ")} />}
              {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={3.5} fill={color} />)}
            </g>
          );
        })}
      </svg>
      {series.length > 1 && <Legend series={series} />}
    </figure>
  );
}

export function BarChart({ categories, series, unit = "", title }: { categories: string[]; series: Series[]; unit?: string; title: string }) {
  const W = 560, H = 230, L = 40, R = 12, T = 12, B = 30;
  const all = series.flatMap((s) => s.values.filter((v): v is number => v !== null));
  const top = niceMax(Math.max(...all, 1));
  const groupW = (W - L - R) / categories.length;
  const barW = Math.min(36, (groupW * 0.75) / series.length);
  const y = (v: number) => T + (H - T - B) * (1 - v / top);
  return (
    <figure style={{ margin: 0 }}>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={title}>
        {[0, top / 2, top].map((t) => (
          <g key={t}>
            <line className="grid-line" x1={L} x2={W - R} y1={y(t)} y2={y(t)} />
            <text x={L - 6} y={y(t) + 4} textAnchor="end">{Math.round(t)}{unit}</text>
          </g>
        ))}
        {categories.map((c, ci) => {
          const gx = L + ci * groupW + (groupW - barW * series.length) / 2;
          return (
            <g key={c}>
              {series.map((s, si) => {
                const v = s.values[ci];
                if (v === null || v === undefined) return null;
                return (
                  <g key={s.name}>
                    <rect x={gx + si * barW} y={y(v)} width={barW - 3} height={H - B - y(v)} fill={s.color ?? PALETTE[si % PALETTE.length]} rx={3} />
                    <text x={gx + si * barW + (barW - 3) / 2} y={y(v) - 3} textAnchor="middle">{v}</text>
                  </g>
                );
              })}
              <text x={L + ci * groupW + groupW / 2} y={H - 10} textAnchor="middle">{c}</text>
            </g>
          );
        })}
      </svg>
      {series.length > 1 && <Legend series={series} />}
    </figure>
  );
}
