import { ArrowRight, Clapperboard, Compass, Gauge, Globe, Repeat2, Search, Smartphone, Sparkles, UserRound, Wand2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Artwork } from "@/components/art/Artwork";
import { Avatar } from "@/components/art/Avatar";
import { JsonLd } from "@/components/ui/primitives";
import { getFeedPage, topCreators } from "@/lib/data";
import { KINDS } from "@/lib/kinds";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `About ${site.name} — the social network for AI creators`,
  description:
    "Share everything you make with AI — images, video, music, writing, code, data viz and 3D. Build a portfolio, get discovered in Explore and Flow, and let others remix your prompts with credit.",
  alternates: { canonical: "/about" },
};

const FEATURES = [
  { icon: Compass, title: "Endless discovery", body: "Explore serves a fresh, randomized mosaic every visit. Flow turns it into a full-screen stream you can swipe forever." },
  { icon: Wand2, title: "Prompts that travel", body: "Every post shows its prompt and model. Copy it in one tap, or remix it — the original creator is always credited." },
  { icon: UserRound, title: "A profile that's a portfolio", body: "Your work is organized by format automatically, with highlights, filters and a share-ready link." },
  { icon: Smartphone, title: "Made for every screen", body: "Thumb-friendly tabs on phones, a compact rail on tablets, and a roomy three-column layout on desktop." },
  { icon: Globe, title: "Built to be found", body: "Rich share cards, structured data and fast server-rendered pages help your work show up in search and social." },
  { icon: Gauge, title: "Fast by default", body: "Lightweight pages and media that load only what's on screen, so scrolling stays smooth on any device." },
];

const FAQ = [
  { q: `What can I share on ${site.name}?`, a: "Anything made with AI: images and image series, video, music, writing, code, chat transcripts, charts and data stories, and 3D models." },
  { q: "Do I have to share my prompt?", a: "Sharing prompts is encouraged because it helps everyone learn, but you control what you post. Remixes always credit the original creator." },
  { q: "What is Flow?", a: "Flow is a full-screen, vertical feed. Swipe (or use the arrow keys) to move through an endless stream of AI work, double-tap to like, and open any prompt." },
  { q: "Which AI tools are supported?", a: "All of them. Tag your post with the model or tool you used — image, video, music, text, code or 3D — so others can find work made with it." },
  { q: `Is ${site.name} free?`, a: "Yes. Creating a profile, posting, exploring and remixing are free." },
];

const TESTIMONIALS = [
  { username: "dreamframes", quote: "My clips finally live next to the prompts that made them. People actually learn from my work now." },
  { username: "codepoet", quote: "It's the first place where a shader, a poem and a song can sit on the same profile and all make sense." },
  { username: "softglitch", quote: "Flow is dangerous. I open it for one minute and suddenly I have twelve new ideas." },
];

export default function AboutPage() {
  const tiles = getFeedPage({ feed: "explore", seed: 2026, limit: 20 }).items;
  const creators = topCreators(24);
  const rowA = tiles.slice(0, 10);
  const rowB = tiles.slice(10, 20);

  return (
    <div className="overflow-hidden">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />

      {/* Hero */}
      <section className="relative px-5 pb-12 pt-14 text-center md:pt-24">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-60 [background:radial-gradient(60%_50%_at_50%_0%,rgba(124,58,237,.35),transparent),radial-gradient(40%_40%_at_80%_20%,rgba(219,39,119,.25),transparent)]" />
        <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-line bg-card/60 px-3 py-1 text-sm backdrop-blur">
          <Sparkles className="size-4 text-accent" aria-hidden /> The social network for AI creators
        </p>
        <h1 className="mx-auto mt-6 max-w-4xl font-display text-5xl leading-[1.02] tracking-tight text-balance sm:text-7xl md:text-8xl">
          Where AI work gets <em className="text-brand pr-2">seen.</em>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted text-balance md:text-xl">
          Share the images, films, songs, stories, code and worlds you make with AI. Get discovered, inspire others, and watch your prompts get remixed.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/explore" className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 font-semibold text-white shadow-xl shadow-fuchsia-500/25 transition hover:scale-[1.02]">
            Start exploring <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link href="/create" className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3.5 font-semibold hover:bg-elevated">
            Share your work
          </Link>
        </div>
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="flex -space-x-2.5">
            {creators.slice(0, 6).map((u) => (
              <Avatar key={u.id} user={u} size={34} className="ring-2 ring-bg" />
            ))}
          </div>
          <p className="text-left text-sm text-muted">
            Loved by AI artists, filmmakers,
            <br className="sm:hidden" /> musicians, writers and coders
          </p>
        </div>
      </section>

      {/* Marquee collage */}
      <section aria-label="Recent showcases" className="space-y-3 py-6 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        {[rowA, rowB].map((row, ri) => (
          <div key={ri} className={`flex w-max gap-3 ${ri ? "animate-marquee-reverse" : "animate-marquee"} hover:[animation-play-state:paused]`}>
            {[...row, ...row].map((p, i) => (
              <Link key={`${p.id}-${i}`} href={`/p/${p.id}`} tabIndex={i >= row.length ? -1 : undefined} className="relative h-40 w-32 shrink-0 overflow-hidden rounded-2xl sm:h-56 sm:w-44">
                <Artwork visual={p.visuals[0]} label={p.title} />
              </Link>
            ))}
          </div>
        ))}
      </section>

      {/* Formats */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <h2 className="text-center font-display text-4xl tracking-tight md:text-6xl">Every kind of AI output.</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted">One profile for everything you create, each format displayed the way it deserves.</p>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {KINDS.map(({ id, plural, blurb, icon: Icon }) => (
            <Link key={id} href={`/explore?kind=${id}`} className="group rounded-2xl border border-line bg-card p-5 transition hover:-translate-y-0.5 hover:border-accent">
              <span className="grid size-11 place-items-center rounded-xl bg-brand text-white">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-semibold">{plural}</h3>
              <p className="mt-1 text-sm text-muted">{blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-line bg-elevated/40 px-5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-2xl font-display text-4xl tracking-tight md:text-6xl">Designed for creators, tuned for discovery.</h2>
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title}>
                <Icon className="size-6 text-accent" aria-hidden />
                <h3 className="mt-3 text-lg font-semibold">{title}</h3>
                <p className="mt-1.5 text-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <h2 className="text-center font-display text-4xl tracking-tight md:text-6xl">Three steps to your audience.</h2>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { icon: Sparkles, t: "Create", d: "Make something with any AI tool. Image, track, film, poem, app — it all counts." },
            { icon: Search, t: "Share", d: "Post it with the prompt and model. It's instantly searchable, taggable and shareable." },
            { icon: Repeat2, t: "Get remixed", d: "Others build on your prompt with credit, and your work keeps travelling." },
          ].map(({ icon: Icon, t, d }, i) => (
            <li key={t} className="relative rounded-3xl border border-line bg-card p-6">
              <span className="font-display text-6xl text-brand">{i + 1}</span>
              <h3 className="mt-2 flex items-center gap-2 text-xl font-semibold">
                <Icon className="size-5" aria-hidden /> {t}
              </h3>
              <p className="mt-1.5 text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Testimonials */}
      <section className="px-5 pb-16 md:pb-24">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => {
            const u = creators.find((c) => c.username === t.username)!;
            return (
              <figure key={t.username} className="rounded-3xl border border-line bg-card p-6">
                <blockquote className="font-display text-2xl leading-snug">“{t.quote}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <Avatar user={u} size={40} />
                  <span className="leading-tight">
                    <Link href={`/u/${u.username}`} className="font-semibold hover:underline">
                      {u.name}
                    </Link>
                    <span className="block text-sm text-muted">{u.headline}</span>
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 pb-16 md:pb-24">
        <h2 className="text-center font-display text-4xl tracking-tight md:text-5xl">Questions, answered.</h2>
        <div className="mt-8 divide-y divide-line rounded-3xl border border-line">
          {FAQ.map((f) => (
            <details key={f.q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {f.q}
                <span className="text-xl text-muted transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-2 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 pb-20">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-brand px-6 py-14 text-center text-white md:py-20">
          <h2 className="font-display text-4xl tracking-tight md:text-6xl">Your best work deserves an audience.</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">Post your first showcase in under a minute.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/create" className="rounded-full bg-white px-6 py-3.5 font-semibold text-black transition hover:scale-[1.02]">
              Create a post
            </Link>
            <Link href="/flow" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/50 px-6 py-3.5 font-semibold hover:bg-white/10">
              <Clapperboard className="size-4" aria-hidden /> Watch Flow
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
