"use client";

import { Clapperboard, Compass, Heart, Home, Info, Plus, Search, SquarePlus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/art/Avatar";
import { Logo, LogoMark } from "@/components/art/Logo";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";
import type { Viewer } from "@/server/session";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/flow", label: "Flow", icon: Clapperboard },
  { href: "/notifications", label: "Notifications", icon: Heart },
  { href: "/create", label: "Create", icon: SquarePlus },
];

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
}

/** Unread badge for the notifications entry. Shown only when there is something unread. */
function UnreadDot({ count }: { count: number }) {
  if (!count) return null;
  return <span className="absolute right-2 top-2 size-2 rounded-full bg-like ring-2 ring-bg" aria-label={`${count} unread`} role="status" />;
}

/** Tablet: icon rail (76px). Desktop (xl): full sidebar with labels. Hidden on phones. */
export function Sidebar({ viewer, unread }: { viewer: Viewer | null; unread: number }) {
  const isActive = useIsActive();
  const row = "group relative flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-elevated";

  return (
    <aside className="sticky top-0 z-30 hidden h-dvh shrink-0 flex-col border-r border-line bg-bg px-3 pb-5 pt-7 md:flex md:w-[76px] xl:w-[244px]">
      <Link href="/" aria-label={`${site.name} home`} className="mb-8 flex h-10 items-center px-2.5">
        <LogoMark className="size-7 xl:hidden" />
        <Logo className="hidden xl:flex" />
      </Link>
      <nav aria-label="Main" className="flex flex-1 flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} title={label} aria-current={active ? "page" : undefined} className={cn(row, active && "font-bold")}>
              <span className="relative">
                <Icon className="size-6 shrink-0 transition-transform group-hover:scale-110" strokeWidth={active ? 2.6 : 1.9} />
                {href === "/notifications" && <UnreadDot count={unread} />}
              </span>
              <span className="hidden xl:inline">{label}</span>
            </Link>
          );
        })}
        {viewer ? (
          <Link href={`/u/${viewer.username}`} title="Profile" aria-current={isActive(`/u/${viewer.username}`) ? "page" : undefined} className={cn(row, isActive(`/u/${viewer.username}`) && "font-bold")}>
            <Avatar user={{ name: viewer.name, username: viewer.username, avatar: viewer.avatar }} size={26} className={cn(isActive(`/u/${viewer.username}`) && "ring-2 ring-fg ring-offset-2 ring-offset-bg")} />
            <span className="hidden xl:inline">Profile</span>
          </Link>
        ) : (
          <Link href="/login" title="Log in" className={row}>
            <Avatar user={{ name: "?", username: "guest" }} size={26} />
            <span className="hidden xl:inline">Log in</span>
          </Link>
        )}
      </nav>
      <div className="flex flex-col gap-1">
        <Link href="/about" title="About" aria-current={isActive("/about") ? "page" : undefined} className={row}>
          <Info className="size-6 shrink-0" strokeWidth={1.9} />
          <span className="hidden xl:inline">About {site.name}</span>
        </Link>
        <ThemeToggle withLabel />
      </div>
    </aside>
  );
}

/** Phone-only top bar. Hidden in Flow, which is full-screen. */
export function MobileHeader({ viewer, unread }: { viewer: Viewer | null; unread: number }) {
  const pathname = usePathname();
  if (pathname.startsWith("/flow")) return null;
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg/85 px-4 backdrop-blur-xl md:hidden">
      <Link href="/" aria-label={`${site.name} home`}>
        <Logo />
      </Link>
      <div className="flex items-center">
        <Link href="/search" aria-label="Search" className="grid size-10 place-items-center rounded-full hover:bg-elevated">
          <Search className="size-[22px]" strokeWidth={1.9} />
        </Link>
        {viewer ? (
          <Link href="/notifications" aria-label="Notifications" className="relative grid size-10 place-items-center rounded-full hover:bg-elevated">
            <Heart className="size-[22px]" strokeWidth={1.9} />
            <UnreadDot count={unread} />
          </Link>
        ) : (
          <Link href="/login" className="rounded-full px-3 py-1.5 text-sm font-semibold text-accent hover:bg-elevated">
            Log in
          </Link>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}

/** Phone-only bottom tab bar, respecting the iOS home-indicator safe area. */
export function BottomNav({ viewer }: { viewer: Viewer | null }) {
  const isActive = useIsActive();
  const pathname = usePathname();
  const dark = pathname.startsWith("/flow");
  const items = [
    { href: "/", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/create", label: "Create", icon: Plus },
    { href: "/flow", label: "Flow", icon: Clapperboard },
  ];
  const profileHref = viewer ? `/u/${viewer.username}` : "/login";
  return (
    <nav
      aria-label="Main"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden",
        dark ? "border-white/10 bg-black/90 text-white" : "border-line bg-bg/90",
      )}
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={href}>
              <Link href={href} aria-label={label} aria-current={active ? "page" : undefined} className="flex h-full items-center justify-center">
                {href === "/create" ? (
                  <span className="grid size-10 place-items-center rounded-xl bg-brand text-white shadow-lg shadow-fuchsia-500/20">
                    <Icon className="size-6" strokeWidth={2.4} />
                  </span>
                ) : (
                  <Icon className="size-[26px]" strokeWidth={active ? 2.6 : 1.8} />
                )}
              </Link>
            </li>
          );
        })}
        <li>
          <Link href={profileHref} aria-label={viewer ? "Your profile" : "Log in"} aria-current={viewer && isActive(profileHref) ? "page" : undefined} className="flex h-full items-center justify-center">
            {viewer ? (
              <Avatar user={{ name: viewer.name, username: viewer.username, avatar: viewer.avatar }} size={28} className={cn(isActive(profileHref) && "ring-2 ring-current ring-offset-2 ring-offset-transparent")} />
            ) : (
              <span className="text-sm font-semibold text-accent">Log in</span>
            )}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
