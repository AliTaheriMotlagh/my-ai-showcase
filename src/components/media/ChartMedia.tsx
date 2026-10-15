import { useId } from "react";
import { hashString } from "@/lib/random";
import { cn } from "@/lib/cn";
import { compact } from "@/lib/format";
import type { ChartSpec } from "@/lib/types";
import type { MediaProps } from "./shared";

const COLORS = ["#a78bfa", "#f472b6", "#38bdf8", "#34d399", "#fbbf24", "#fb7185"];

const fmt = (v: number, unit?: string) => (unit === "$" ? `$${compact(v)}` : `${compact(v)}${unit ?? ""}`);

function niceMax(m: number) {
  if (m <= 0) return 1;
  const mag = 10 ** Math.floor(Math.log10(m));
  return (Math.ceil((m / mag) * 2) / 2) * mag;
}

function insight(spec: ChartSpec) {
  const total = spec.values.reduce((s, v) => s + v, 0);
  const i = spec.values.indexOf(Math.max(...spec.values));
  if (spec.type === "donut") return `Largest share: ${spec.labels[i]} (${Math.round((spec.values[i] / total) * 100)}%)`;
  if (spec.type === "line") return `Peak at ${spec.labels[i]}: ${fmt(spec.values[i], spec.unit)}`;
  return `Highest: ${spec.labels[i]} with ${fmt(spec.values[i], spec.unit)}`;
}

export function ChartSvg({ spec, seed, compactMode }: { spec: ChartSpec; seed: number; compactMode?: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const colors = [...COLORS.slice(seed % COLORS.length), ...COLORS.slice(0, seed % COLORS.length)];
  const W = 320;
  const H = 200;

  if (spec.type === "donut") {
    const total = spec.values.reduce((s, v) => s + v, 0) || 1;
    const R = 62;
    const C = 2 * Math.PI * R;
    const lengths = spec.values.map((v) => (v / total) * C);
    const offsets = lengths.map((_, i) => lengths.slice(0, i).reduce((s, l) => s + l, 0));
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label={`Donut chart: ${spec.labels.join(", ")}`}>
        <g transform="rotate(-90 100 100)">
          {lengths.map((len, i) => (
            <circle
              key={i}
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke={colors[i % colors.length]}
              strokeWidth="26"
              strokeDasharray={`${Math.max(0, len - 2)} ${C}`}
              strokeDashoffset={-offsets[i]}
              className="chart-draw"
            />
          ))}
        </g>
        <text x="100" y="98" textAnchor="middle" fontSize="20" fontWeight="700" fill="currentColor">
          {fmt(total, spec.unit)}
        </text>
        <text x="100" y="116" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.55">
          total
        </text>
        {!compactMode &&
          spec.labels.map((l, i) => (
            <g key={l} transform={`translate(190 ${52 + i * 26})`}>
              <rect width="10" height="10" rx="3" fill={colors[i % colors.length]} />
              <text x="16" y="9" fontSize="11" fill="currentColor">
                {l} <tspan opacity="0.55">{Math.round((spec.values[i] / total) * 100)}%</tspan>
              </text>
            </g>
          ))}
      </svg>
    );
  }

  const L = compactMode ? 6 : 34;
  const R = 8;
  const T = 14;
  const B = compactMode ? 6 : 24;
  const iw = W - L - R;
  const ih = H - T - B;
  const max = niceMax(Math.max(...spec.values));
  const n = spec.values.length;
  const y = (v: number) => T + ih - (v / max) * ih;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label={`${spec.type} chart of ${spec.labels.join(", ")}`}>
      <defs>
        <linearGradient id={`${uid}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={colors[0]} />
          <stop offset="1" stopColor={colors[1]} />
        </linearGradient>
        <linearGradient id={`${uid}a`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={colors[0]} stopOpacity="0.45" />
          <stop offset="1" stopColor={colors[0]} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((g) => (
        <g key={g}>
          <line x1={L} x2={W - R} y1={y(max * g)} y2={y(max * g)} stroke="currentColor" opacity="0.1" />
          {!compactMode && (
            <text x={L - 6} y={y(max * g) + 3} textAnchor="end" fontSize="9" fill="currentColor" opacity="0.5">
              {fmt(max * g, spec.unit)}
            </text>
          )}
        </g>
      ))}
      {spec.type === "bar" ? (
        spec.values.map((v, i) => {
          const slot = iw / n;
          const bw = slot * 0.62;
          return (
            <rect
              key={i}
              x={L + i * slot + (slot - bw) / 2}
              y={y(v)}
              width={bw}
              height={T + ih - y(v)}
              rx="4"
              fill={`url(#${uid}g)`}
              className="chart-bar"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          );
        })
      ) : (
        <LinePath values={spec.values} L={L} iw={iw} y={y} bottom={T + ih} uid={uid} color={colors[0]} />
      )}
      {!compactMode &&
        spec.labels.map((l, i) => (
          <text key={l} x={L + (i + 0.5) * (iw / n)} y={H - 7} textAnchor="middle" fontSize="9.5" fill="currentColor" opacity="0.6">
            {l}
          </text>
        ))}
    </svg>
  );
}

function LinePath({ values, L, iw, y, bottom, uid, color }: { values: number[]; L: number; iw: number; y: (v: number) => number; bottom: number; uid: string; color: string }) {
  const n = values.length;
  const pts = values.map((v, i) => [L + (i + 0.5) * (iw / n), y(v)] as const);
  const d = pts.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`).join("");
  const area = `${d}L${pts[n - 1][0].toFixed(1)} ${bottom}L${pts[0][0].toFixed(1)} ${bottom}Z`;
  return (
    <>
      <path d={area} fill={`url(#${uid}a)`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" pathLength={1000} className="chart-line" />
      {pts.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r="3" fill="var(--card)" stroke={color} strokeWidth="2" />
      ))}
    </>
  );
}

export function ChartMedia({ post, variant }: MediaProps) {
  const spec = post.chart ?? { type: "bar" as const, labels: [], values: [] };
  const seed = hashString(post.id);

  if (variant === "tile") {
    return (
      <div className="absolute inset-0 flex flex-col bg-card p-3">
        <p className="line-clamp-2 text-[11px] font-semibold leading-tight sm:text-xs">{post.title}</p>
        <div className="mt-2 min-h-0 flex-1">
          <ChartSvg spec={spec} seed={seed} compactMode />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col bg-card p-4 sm:p-6", variant === "full" && "h-full w-full justify-center overflow-y-auto")}>
      <p className="text-xs uppercase tracking-wider text-muted">Data · {spec.type} chart</p>
      <h3 className="mt-1 text-lg font-semibold leading-snug">{post.title}</h3>
      <p className="text-sm text-muted">{insight(spec)}</p>
      <div className="mx-auto mt-4 aspect-[16/10] w-full max-w-2xl">
        <ChartSvg spec={spec} seed={seed} />
      </div>
    </div>
  );
}
