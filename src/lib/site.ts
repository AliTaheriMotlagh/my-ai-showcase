export const site = {
  name: "Latent",
  tagline: "Where AI work gets seen",
  description:
    "Latent is the social network for AI creators. Share images, video, music, writing, code, data viz and 3D made with AI — discover endless inspiration, remix prompts and grow your audience.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  twitter: "@latent",
  keywords: [
    "AI art",
    "AI showcase",
    "AI portfolio",
    "AI generated images",
    "AI video",
    "AI music",
    "prompt sharing",
    "generative art",
    "AI creators",
    "social network for AI",
  ],
};

export const absoluteUrl = (path = "/") => `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
