import { cn } from "@/lib/cn";
import { altText, frameClass, type MediaProps } from "./shared";

/** A pure-CSS 3D preview (no WebGL) — swap for <model-viewer> or three.js with real assets. */

const FACES = ["rotateY(0deg)", "rotateY(90deg)", "rotateY(180deg)", "rotateY(-90deg)", "rotateX(90deg)", "rotateX(-90deg)"];

function Sphere({ colors }: { colors: string[] }) {
  return (
    <>
      {Array.from({ length: 9 }, (_, i) => (
        <div key={`m${i}`} className="ring3d" style={{ transform: `rotateY(${(i * 180) / 9}deg)`, color: colors[i % colors.length] }} />
      ))}
      {[-0.6, -0.3, 0, 0.3, 0.6].map((h, i) => (
        <div
          key={`p${i}`}
          className="ring3d"
          style={{
            transform: `rotateX(90deg) translateZ(calc(var(--s) * ${h / 2})) scale(${Math.sqrt(1 - h * h).toFixed(3)})`,
            color: colors[(i + 2) % colors.length],
          }}
        />
      ))}
    </>
  );
}

function Cube({ colors }: { colors: string[] }) {
  return (
    <>
      {FACES.map((t) => (
        <div key={`o${t}`} className="face3d" style={{ transform: `${t} translateZ(calc(var(--s) / 2))`, color: colors[0] }} />
      ))}
      <div className="p3d" style={{ transform: "scale(0.5)" }}>
        {FACES.map((t, i) => (
          <div
            key={`i${t}`}
            className="face3d solid"
            style={{
              transform: `${t} translateZ(calc(var(--s) / 2))`,
              color: colors[2],
              background: `linear-gradient(135deg, ${colors[(i + 1) % colors.length]}cc, ${colors[(i + 2) % colors.length]}77)`,
            }}
          />
        ))}
      </div>
    </>
  );
}

function Atom({ colors }: { colors: string[] }) {
  return (
    <>
      {[0, 60, 120].map((deg, i) => (
        <div key={deg} className="p3d" style={{ transform: `rotateY(${deg}deg) rotateX(72deg)` }}>
          <div className="ring3d orbit3d" style={{ color: colors[i % colors.length], animationDuration: `${3 + i}s` }}>
            <span className="electron" />
          </div>
        </div>
      ))}
    </>
  );
}

export function ThreeDMedia({ post, variant }: MediaProps) {
  const v = post.visuals[0];
  const p = v.palette;
  const colors = p.slice(1);
  const shape = post.object3d?.shape ?? "sphere";
  return (
    <div
      role="img"
      aria-label={altText(post)}
      className={cn(frameClass(variant, "aspect-square"), "overflow-hidden")}
      style={{ background: `radial-gradient(circle at 50% 42%, ${p[2]}66, ${p[0]} 62%), ${p[0]}` }}
    >
      <div
        className="absolute inset-x-[18%] bottom-[10%] h-[10%] rounded-[50%] blur-md"
        style={{ background: `radial-gradient(closest-side, ${p[1]}aa, transparent)` }}
      />
      <div className="three-stage absolute inset-0">
        <div
          className="absolute left-1/2 top-1/2 size-[18cqmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-sm"
          style={{ background: `radial-gradient(circle at 35% 30%, #fff, ${colors[0]} 45%, transparent 72%)` }}
        />
        <div
          className={cn("three-obj", variant === "tile" && "paused")}
          style={{ animationDuration: `${10 + (v.seed % 9)}s`, animationDelay: `-${v.seed % 10}s` }}
        >
          {shape === "sphere" && <Sphere colors={colors} />}
          {shape === "cube" && <Cube colors={colors} />}
          {shape === "atom" && <Atom colors={colors} />}
        </div>
      </div>
      {variant !== "tile" && (
        <span className="absolute bottom-3 left-3 rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">
          3D preview · {post.model}
        </span>
      )}
    </div>
  );
}
