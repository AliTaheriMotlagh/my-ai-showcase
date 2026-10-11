import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { int, mulberry32, pick } from "@/lib/random";
import type { Visual } from "@/lib/types";

/**
 * Renders a post visual: either an uploaded image or deterministic generative art
 * (SVG/CSS, seeded) — lightweight, crisp at any size and identical on server and client.
 */

type Props = {
  visual: Visual;
  label?: string;
  className?: string;
  fit?: "cover" | "contain";
  animated?: boolean;
  grain?: boolean;
};

export function Artwork({ visual, label, className, fit = "cover", animated, grain = true }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  if (visual.src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- user uploads are data URLs
      <img
        src={visual.src}
        alt={label ?? ""}
        draggable={false}
        loading="lazy"
        decoding="async"
        className={cn("h-full w-full", fit === "cover" ? "object-cover" : "object-contain", className)}
      />
    );
  }
  return (
    <div
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("relative h-full w-full overflow-hidden", grain && "grain", className)}
      style={{ backgroundColor: visual.palette[0] }}
    >
      <div className={cn("absolute inset-0", animated && "art-motion")}>{renderArt(visual, uid)}</div>
    </div>
  );
}

type ArtProps = { v: Visual; uid: string };

// One decimal is plenty in a 100×100 viewBox and keeps server HTML small.
const f = (n: number) => Math.round(n * 10) / 10;

function renderArt(v: Visual, uid: string) {
  switch (v.style) {
    case "mesh":
      return <Mesh v={v} uid={uid} />;
    case "orbit":
      return <Orbit v={v} uid={uid} />;
    case "bauhaus":
      return <Bauhaus v={v} uid={uid} />;
    case "waves":
      return <Waves v={v} uid={uid} />;
    case "flow":
      return <FlowLines v={v} uid={uid} />;
    case "bloom":
      return <Bloom v={v} uid={uid} />;
    case "planet":
      return <Planet v={v} uid={uid} />;
    case "dunes":
      return <Dunes v={v} uid={uid} />;
  }
}

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      {children}
    </svg>
  );
}

function Mesh({ v }: ArtProps) {
  const r = mulberry32(v.seed);
  const acc = v.palette.slice(1);
  const layers = Array.from(
    { length: 6 },
    (_, i) => `radial-gradient(at ${f(r() * 100)}% ${f(r() * 100)}%, ${acc[i % acc.length]} 0px, transparent ${f(42 + r() * 28)}%)`,
  );
  return <div className="absolute inset-0" style={{ backgroundImage: layers.join(", ") }} />;
}

function Orbit({ v, uid }: ArtProps) {
  const r = mulberry32(v.seed);
  const p = v.palette;
  const acc = p.slice(1);
  const cx = f(50 + (r() - 0.5) * 36);
  const cy = f(50 + (r() - 0.5) * 36);
  const rings = int(r, 6, 12);
  return (
    <Svg>
      <defs>
        <radialGradient id={`${uid}o`}>
          <stop offset="0" stopColor={acc[0]} stopOpacity="0.85" />
          <stop offset="1" stopColor={p[0]} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r="55" fill={`url(#${uid}o)`} />
      {Array.from({ length: rings }, (_, i) => {
        const rad = f(5 + i * (64 / rings) + r() * 2);
        const a = r() * Math.PI * 2;
        const dash = r() < 0.4 ? `${f(1 + r() * 6)} ${f(1 + r() * 4)}` : undefined;
        return (
          <g key={i}>
            <circle
              cx={cx}
              cy={cy}
              r={rad}
              fill="none"
              stroke={acc[i % acc.length]}
              strokeWidth={f(0.25 + r() * 1.8)}
              strokeDasharray={dash}
              opacity={f(0.55 + r() * 0.45)}
            />
            <circle cx={f(cx + Math.cos(a) * rad)} cy={f(cy + Math.sin(a) * rad)} r={f(0.6 + r() * 2.4)} fill={acc[(i + 2) % acc.length]} />
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={f(2.5 + r() * 4)} fill={acc[acc.length - 1]} />
    </Svg>
  );
}

function Bauhaus({ v }: ArtProps) {
  const r = mulberry32(v.seed);
  const p = v.palette;
  const n = pick(r, [3, 4, 4, 5]);
  const s = 100 / n;
  const c = f(s / 2);
  const cells: ReactNode[] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const x0 = f(x * s);
      const y0 = f(y * s);
      const bg = pick(r, p);
      let fg = pick(r, p);
      if (fg === bg) fg = p[(p.indexOf(bg) + 2) % p.length];
      const t = `rotate(${int(r, 0, 3) * 90} ${f(x0 + c)} ${f(y0 + c)})`;
      const shape = int(r, 0, 4);
      let el: ReactNode;
      if (shape === 0) el = <path d={`M${x0} ${y0}h${f(s)}A${f(s)} ${f(s)} 0 0 1 ${x0} ${f(y0 + s)}Z`} fill={fg} transform={t} />;
      else if (shape === 1) el = <circle cx={f(x0 + c)} cy={f(y0 + c)} r={f(s * 0.34)} fill={fg} />;
      else if (shape === 2) el = <path d={`M${x0} ${f(y0 + c)}A${c} ${c} 0 0 1 ${f(x0 + s)} ${f(y0 + c)}Z`} fill={fg} transform={t} />;
      else if (shape === 3) el = <path d={`M${x0} ${f(y0 + s)}L${f(x0 + s)} ${f(y0 + s)}L${x0} ${y0}Z`} fill={fg} transform={t} />;
      else
        el = (
          <rect
            x={f(x0 + s * 0.3)}
            y={f(y0 + s * 0.3)}
            width={f(s * 0.4)}
            height={f(s * 0.4)}
            fill={fg}
            transform={`rotate(45 ${f(x0 + c)} ${f(y0 + c)})`}
          />
        );
      cells.push(
        <g key={`${x}-${y}`}>
          <rect x={x0} y={y0} width={f(s + 0.2)} height={f(s + 0.2)} fill={bg} />
          {el}
        </g>,
      );
    }
  }
  return <Svg>{cells}</Svg>;
}

function Waves({ v, uid }: ArtProps) {
  const r = mulberry32(v.seed);
  const p = v.palette;
  const acc = p.slice(1);
  const layers = int(r, 5, 7);
  const sun = { x: f(20 + r() * 60), y: f(14 + r() * 18), r: f(7 + r() * 9) };
  return (
    <Svg>
      <defs>
        <linearGradient id={`${uid}w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p[0]} />
          <stop offset="1" stopColor={acc[0]} stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${uid}w)`} />
      <circle cx={sun.x} cy={sun.y} r={sun.r} fill={acc[acc.length - 1]} opacity="0.95" />
      {Array.from({ length: layers }, (_, i) => {
        const base = 34 + i * (62 / layers);
        const amp = 1.5 + r() * 5;
        const freq = 0.04 + r() * 0.09;
        const ph = r() * 6.28;
        const y = (x: number) => f(base + Math.sin(x * freq + ph) * amp + Math.sin(x * freq * 2.3 + ph) * amp * 0.3);
        let d = `M-5 105L-5 ${y(-5)}`;
        for (let x = 0; x <= 105; x += 3.5) d += `L${x} ${y(x)}`;
        d += "L105 105Z";
        return <path key={i} d={d} fill={acc[i % acc.length]} opacity={f(0.75 + (i / layers) * 0.25)} />;
      })}
    </Svg>
  );
}

function FlowLines({ v }: ArtProps) {
  const r = mulberry32(v.seed);
  const acc = v.palette.slice(1);
  const k1 = 0.02 + r() * 0.07;
  const k2 = 0.02 + r() * 0.07;
  const ph1 = r() * 6;
  const ph2 = r() * 6;
  return (
    <Svg>
      {Array.from({ length: 32 }, (_, i) => {
        let x = r() * 110 - 5;
        let y = r() * 110 - 5;
        let d = `M${f(x)} ${f(y)}`;
        for (let s = 0; s < 26; s++) {
          const a = (Math.sin(x * k1 + ph1) + Math.cos(y * k2 + ph2)) * Math.PI;
          x += Math.cos(a) * 2.2;
          y += Math.sin(a) * 2.2;
          d += `L${f(x)} ${f(y)}`;
        }
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={acc[i % acc.length]}
            strokeWidth={f(0.3 + r() * 1.4)}
            strokeLinecap="round"
            opacity={f(0.5 + r() * 0.5)}
          />
        );
      })}
    </Svg>
  );
}

function Bloom({ v, uid }: ArtProps) {
  const r = mulberry32(v.seed);
  const p = v.palette;
  const acc = p.slice(1);
  const cx = f(50 + (r() - 0.5) * 16);
  const cy = f(50 + (r() - 0.5) * 16);
  const layers = int(r, 3, 5);
  const petals: ReactNode[] = [];
  for (let l = 0; l < layers; l++) {
    const count = int(r, 6, 16);
    const rx = (layers - l) * 8 + 3;
    const ry = f(rx * (0.3 + r() * 0.25));
    const off = r() * 360;
    for (let k = 0; k < count; k++) {
      petals.push(
        <ellipse
          key={`${l}-${k}`}
          cx={f(cx + rx)}
          cy={cy}
          rx={rx}
          ry={ry}
          fill={acc[l % acc.length]}
          opacity="0.78"
          transform={`rotate(${f(off + (k * 360) / count)} ${cx} ${cy})`}
        />,
      );
    }
  }
  return (
    <Svg>
      <defs>
        <radialGradient id={`${uid}b`}>
          <stop offset="0" stopColor={acc[2]} stopOpacity="0.6" />
          <stop offset="1" stopColor={p[0]} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r="62" fill={`url(#${uid}b)`} />
      {petals}
      <circle cx={cx} cy={cy} r="3.5" fill={p[0]} />
      <circle cx={cx} cy={cy} r="2" fill={acc[acc.length - 1]} />
    </Svg>
  );
}

function Planet({ v, uid }: ArtProps) {
  const r = mulberry32(v.seed);
  const p = v.palette;
  const acc = p.slice(1);
  const R = f(15 + r() * 13);
  const cx = f(32 + r() * 36);
  const cy = f(38 + r() * 26);
  const tilt = `rotate(${f(-25 + r() * 50)} ${cx} ${cy})`;
  const rx = f(R * 1.85);
  const ry = f(R * 0.42);
  const stars = Array.from({ length: 50 }, (_, i) => (
    <circle key={i} cx={f(r() * 100)} cy={f(r() * 100)} r={f(0.12 + r() * 0.35)} fill="#fff" opacity={f(0.25 + r() * 0.75)} />
  ));
  return (
    <Svg>
      <defs>
        <linearGradient id={`${uid}s`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p[0]} />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <radialGradient id={`${uid}p`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor={acc[3]} />
          <stop offset="0.5" stopColor={acc[1]} />
          <stop offset="1" stopColor={acc[0]} />
        </radialGradient>
        <radialGradient id={`${uid}h`}>
          <stop offset="0.6" stopColor={acc[1]} stopOpacity="0.35" />
          <stop offset="1" stopColor={acc[1]} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${uid}s)`} />
      {stars}
      <circle cx={cx} cy={cy} r={f(R * 1.5)} fill={`url(#${uid}h)`} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={acc[2]} strokeWidth="1.6" opacity="0.5" transform={tilt} />
      <circle cx={cx} cy={cy} r={R} fill={`url(#${uid}p)`} />
      {/* front half of the ring, drawn over the planet */}
      <path d={`M${f(cx - rx)} ${cy}A${rx} ${ry} 0 0 0 ${f(cx + rx)} ${cy}`} fill="none" stroke={acc[2]} strokeWidth="1.6" transform={tilt} />
      <circle cx={f((cx + 40) % 100)} cy={f(12 + r() * 20)} r={f(1.5 + r() * 2.5)} fill={acc[3]} />
    </Svg>
  );
}

function Dunes({ v, uid }: ArtProps) {
  const r = mulberry32(v.seed);
  const p = v.palette;
  const acc = p.slice(1);
  const sun = { x: f(20 + r() * 60), y: f(22 + r() * 20), r: f(8 + r() * 9) };
  return (
    <Svg>
      <defs>
        <linearGradient id={`${uid}d`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p[0]} />
          <stop offset="1" stopColor={acc[2]} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${uid}d)`} />
      <circle cx={sun.x} cy={sun.y} r={f(sun.r * 1.9)} fill={acc[3]} opacity="0.22" />
      <circle cx={sun.x} cy={sun.y} r={sun.r} fill={acc[3]} />
      {Array.from({ length: 4 }, (_, i) => {
        const base = 48 + i * 13;
        const amp = 3 + r() * 9;
        const freq = 0.03 + r() * 0.05;
        const ph = r() * 6;
        let d = "M-5 105";
        for (let x = -5; x <= 106; x += 3) {
          d += `L${x} ${f(base - Math.abs(Math.sin(x * freq + ph)) * amp - Math.sin(x * freq * 3.1 + ph) * amp * 0.25)}`;
        }
        d += "L106 105Z";
        return (
          <g key={i}>
            <path d={d} fill={acc[i % 3]} />
            <path d={d} fill="#000" opacity={f(0.12 + i * 0.16)} />
          </g>
        );
      })}
    </Svg>
  );
}
