import type { Metadata } from "next";
import { AccountPanel } from "@/components/settings/AccountPanel";
import { LinksEditor } from "@/components/settings/LinksEditor";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { getProfileByUsername } from "@/server/queries/people";
import { getOwnAccount } from "@/server/queries/people";
import { listLinks } from "@/server/services/profile";
import { requireViewer } from "@/server/session";

export const metadata: Metadata = { title: "Settings", robots: { index: false } };

type Props = { searchParams: Promise<{ tab?: string }> };

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "links", label: "Links" },
  { id: "account", label: "Account" },
] as const;

export default async function SettingsPage({ searchParams }: Props) {
  const viewer = await requireViewer("/settings");
  const { tab: requested } = await searchParams;
  const tab = TABS.some((t) => t.id === requested) ? (requested as (typeof TABS)[number]["id"]) : "profile";

  const [profile, account, links] = await Promise.all([
    getProfileByUsername(viewer.username),
    getOwnAccount(viewer.id),
    listLinks(viewer.id),
  ]);
  if (!profile || !account) return null;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-4 md:pt-8">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
      <p className="mt-1 text-sm text-muted">
        Your public profile is at{" "}
        <a href={`/u/${profile.username}`} className="font-medium text-accent hover:underline">
          /u/{profile.username}
        </a>
        .
      </p>

      <nav aria-label="Settings sections" className="mt-6 grid grid-cols-3 border-b border-line">
        {TABS.map((t) => (
          <a
            key={t.id}
            href={`/settings?tab=${t.id}`}
            aria-current={tab === t.id ? "page" : undefined}
            className={`-mb-px border-b-2 py-3 text-center text-sm font-semibold ${tab === t.id ? "border-fg text-fg" : "border-transparent text-muted hover:text-fg"}`}
          >
            {t.label}
          </a>
        ))}
      </nav>

      <div className="pt-6">
        {tab === "profile" && <ProfileForm profile={profile} userId={viewer.id} />}
        {tab === "links" && (
          <div className="space-y-3">
            <p className="text-sm text-muted">Your link page. Each click is counted, so you can see what people tap.</p>
            <LinksEditor initial={links} />
          </div>
        )}
        {tab === "account" && <AccountPanel email={account.email} />}
      </div>
    </div>
  );
}
