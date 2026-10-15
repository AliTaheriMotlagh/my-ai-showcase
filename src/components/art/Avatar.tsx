import { cn } from "@/lib/cn";
import { paletteFor } from "@/lib/palettes";

type AvatarUser = { name: string; username: string; avatar?: string | null };

/** Uploaded photo when there is one; otherwise a gradient and initial derived from the username. */
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
  const face = user.avatar ? (
    // eslint-disable-next-line @next/next/no-img-element -- user uploads on Blob storage, sized by the parent
    <img
      src={user.avatar}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <FallbackFace user={user} size={size} />
  );
  if (!ring) return <span className={cn("inline-flex shrink-0 rounded-full", className)}>{face}</span>;
  return (
    <span className={cn("inline-flex shrink-0 rounded-full bg-brand p-[2px]", className)}>
      <span className="rounded-full bg-bg p-[2px]">{face}</span>
    </span>
  );
}

function FallbackFace({ user, size }: { user: AvatarUser; size: number }) {
  const p = paletteFor(user.username);
  return (
    <span
      aria-hidden
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(at 30% 25%, ${p[1]} 0, transparent 60%), radial-gradient(at 75% 80%, ${p[3]} 0, transparent 55%), linear-gradient(135deg, ${p[2]}, ${p[4] ?? p[1]})`,
        fontSize: Math.round(size * 0.42),
      }}
    >
      <span style={{ textShadow: "0 1px 6px rgba(0,0,0,.35)" }}>{user.name.trim().charAt(0).toUpperCase() || "•"}</span>
    </span>
  );
}
