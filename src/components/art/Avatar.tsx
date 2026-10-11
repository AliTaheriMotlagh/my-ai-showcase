import { cn } from "@/lib/cn";
import { mulberry32 } from "@/lib/random";
import type { User } from "@/lib/types";

type AvatarUser = Pick<User, "name" | "avatarSeed" | "palette">;

export function Avatar({
  user,
  size = 40,
  ring = false,
  className,
}: {
  user: AvatarUser;
  size?: number;
  ring?: boolean;
  className?: string;
}) {
  const r = mulberry32(user.avatarSeed);
  const p = user.palette;
  const pos = () => `${Math.round(r() * 100)}% ${Math.round(r() * 100)}%`;
  const background = `radial-gradient(at ${pos()}, ${p[1]} 0, transparent 60%), radial-gradient(at ${pos()}, ${p[3]} 0, transparent 55%), linear-gradient(135deg, ${p[2]}, ${p[4] ?? p[1]})`;
  const face = (
    <span
      aria-hidden
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-full font-semibold text-white"
      style={{ width: size, height: size, background, fontSize: Math.round(size * 0.42) }}
    >
      <span style={{ textShadow: "0 1px 6px rgba(0,0,0,.35)" }}>{user.name.charAt(0).toUpperCase()}</span>
    </span>
  );
  if (!ring) return <span className={cn("inline-flex shrink-0 rounded-full", className)}>{face}</span>;
  return (
    <span className={cn("inline-flex shrink-0 rounded-full bg-brand p-[2px]", className)}>
      <span className="rounded-full bg-bg p-[2px]">{face}</span>
    </span>
  );
}
