import { KIND_MAP } from "./kinds";
import { absoluteUrl, site } from "./site";
import type { FeedPost, UserProfile, UserSummary } from "./types";

const person = (u: UserSummary) => ({
  "@type": "Person",
  name: u.name,
  alternateName: `@${u.username}`,
  url: absoluteUrl(`/u/${u.username}`),
});

export function postJsonLd(post: FeedPost) {
  const url = absoluteUrl(`/p/${post.id}`);
  const image = absoluteUrl(`/p/${post.id}/opengraph-image`);
  const author = person(post.author);
  const video = post.media.find((m) => m.type === "video");
  const audio = post.media.find((m) => m.type === "audio");
  const shared: Record<string, unknown> = {
    "@type": KIND_MAP[post.kind].schemaType,
    name: post.title,
    description: post.prompt || post.caption,
    creator: author,
    dateCreated: post.createdAt,
    thumbnailUrl: image,
    keywords: post.tags.join(", "),
  };
  if (video) Object.assign(shared, { contentUrl: video.url, uploadDate: post.createdAt, duration: `PT${Math.round(video.duration ?? 0)}S` });
  if (audio) Object.assign(shared, { contentUrl: audio.url, duration: `PT${Math.round(audio.duration ?? 0)}S` });
  if (post.code) Object.assign(shared, { programmingLanguage: post.code.language, text: post.code.source });
  if (post.text) Object.assign(shared, { text: post.text.body, genre: post.text.form });

  return {
    "@context": "https://schema.org",
    "@type": "SocialMediaPosting",
    "@id": url,
    url,
    headline: post.title,
    articleBody: post.caption,
    datePublished: post.createdAt,
    author,
    image,
    keywords: post.tags.join(", "),
    sharedContent: shared,
    isPartOf: { "@id": `${site.url}/#website` },
    interactionStatistic: [
      { "@type": "InteractionCounter", interactionType: "https://schema.org/LikeAction", userInteractionCount: post.stats.likes },
      { "@type": "InteractionCounter", interactionType: "https://schema.org/CommentAction", userInteractionCount: post.stats.comments },
      { "@type": "InteractionCounter", interactionType: "https://schema.org/ShareAction", userInteractionCount: post.stats.remixes },
    ],
  };
}

export function profileJsonLd(user: UserProfile, posts: number) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: absoluteUrl(`/u/${user.username}`),
    dateCreated: user.joinedAt,
    mainEntity: {
      ...person(user),
      identifier: user.id,
      description: user.bio || user.headline || undefined,
      image: user.avatar ?? absoluteUrl(`/u/${user.username}/opengraph-image`),
      interactionStatistic: [
        { "@type": "InteractionCounter", interactionType: "https://schema.org/FollowAction", userInteractionCount: user.followers },
        { "@type": "InteractionCounter", interactionType: "https://schema.org/WriteAction", userInteractionCount: posts },
      ],
      ...(user.website ? { sameAs: [user.website] } : {}),
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}

export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${site.url}/#org`, name: site.name, url: site.url, logo: absoluteUrl("/icon.svg") },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        description: site.description,
        publisher: { "@id": `${site.url}/#org` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${site.url}/search?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}
