import type { ChatMessage, ChartSpec, PostKind } from "./types";

/**
 * Demo content. Everything here is fictional and exists so the app feels alive
 * before a real database is connected (see README → "Going to production").
 */

export interface SeedUser {
  username: string;
  name: string;
  headline: string;
  bio: string;
  location?: string;
  website?: string;
  focus: PostKind[];
  tools: string[];
  verified: boolean;
  followers: number;
  following: number;
  palette: number;
}

export const SEED_USERS: SeedUser[] = [
  { username: "neonmuse", name: "Mira Okafor", headline: "Generative artist · light & color", bio: "I paint with prompts and light. Daily drops of dreamy neon worlds. Open for commissions ✨", location: "Berlin", website: "miraokafor.example", focus: ["image", "gallery", "video"], tools: ["Midjourney", "FLUX", "Runway"], verified: true, followers: 248_000, following: 312, palette: 0 },
  { username: "latentspace", name: "Kenji Watanabe", headline: "Exploring latent space, one seed at a time", bio: "Ex-architect. Now I build impossible buildings with diffusion models. Prompts always shared.", location: "Kyoto", website: "kenji.example", focus: ["image", "3d", "gallery"], tools: ["Stable Diffusion", "ComfyUI", "Blender"], verified: true, followers: 182_400, following: 201, palette: 2 },
  { username: "promptsmith", name: "Sofia Reyes", headline: "Prompt engineer & storyteller", bio: "Writing with machines since GPT-2. Micro-fiction, poems, and the occasional prompt teardown.", location: "Mexico City", focus: ["text", "chat", "image"], tools: ["Claude", "GPT", "Midjourney"], verified: true, followers: 96_300, following: 540, palette: 1 },
  { username: "pixelalchemy", name: "Arjun Mehta", headline: "Turning text into worlds", bio: "Concept art for games that don't exist (yet). Worldbuilding threads every Friday.", location: "Bengaluru", focus: ["image", "gallery", "3d"], tools: ["Midjourney", "Magnific", "Unreal"], verified: false, followers: 64_200, following: 389, palette: 5 },
  { username: "synthwave.sam", name: "Sam Lindqvist", headline: "AI music producer", bio: "Producer + prompt nerd. Every track starts as a sentence. New loop every morning ☕️🎹", location: "Stockholm", focus: ["audio", "video"], tools: ["Suno", "Udio", "Ableton"], verified: true, followers: 131_000, following: 122, palette: 7 },
  { username: "codepoet", name: "Leila Haddad", headline: "Creative coder · shaders & small tools", bio: "Code is my sketchbook. Pairing with AI to ship tiny delightful things. 100 days of generative code.", location: "Beirut", website: "leila.example", focus: ["code", "chart", "chat"], tools: ["Claude Code", "Cursor", "p5.js"], verified: true, followers: 88_900, following: 610, palette: 9 },
  { username: "dreamframes", name: "Tomás Silva", headline: "AI filmmaker", bio: "Short films, music videos and dream sequences. Text-to-video since day one 🎬", location: "Lisbon", focus: ["video", "image"], tools: ["Sora", "Veo", "Runway"], verified: true, followers: 203_700, following: 98, palette: 11 },
  { username: "vectorvoid", name: "Ana Kowalski", headline: "3D & motion", bio: "Low-poly worlds and glossy objects. Text-to-3D experiments + Blender cleanups.", location: "Warsaw", focus: ["3d", "video", "image"], tools: ["Meshy", "Tripo", "Blender"], verified: false, followers: 41_500, following: 277, palette: 3 },
  { username: "datadiva", name: "Priya Nair", headline: "Data storyteller", bio: "I make spreadsheets beautiful. AI-assisted analysis + charts about creators, culture and tech.", location: "London", focus: ["chart", "code", "chat"], tools: ["Claude", "Python", "Observable"], verified: true, followers: 57_800, following: 433, palette: 6 },
  { username: "chatcraft", name: "Jonah Park", headline: "Conversation designer", bio: "Sharing the AI chats that made me go 'huh'. Agents, workflows and prompt patterns.", location: "Seoul", focus: ["chat", "code", "text"], tools: ["Claude", "GPT", "Gemini"], verified: false, followers: 35_600, following: 802, palette: 10 },
  { username: "inkandai", name: "Hana Sato", headline: "Poet · human-in-the-loop", bio: "Poems co-written with machines. I keep the line breaks; the model keeps me honest.", location: "Osaka", focus: ["text", "image"], tools: ["Claude", "Ideogram"], verified: false, followers: 22_900, following: 345, palette: 4 },
  { username: "studio.flux", name: "Diego Romero", headline: "Brand & product designer", bio: "Moodboards, mockups and visual systems generated in minutes, refined for hours.", location: "Buenos Aires", website: "studioflux.example", focus: ["image", "gallery", "code"], tools: ["FLUX", "Figma", "v0"], verified: true, followers: 77_300, following: 256, palette: 8 },
  { username: "aurora.labs", name: "Freya Nilsson", headline: "Nature × machine", bio: "Northern light, moss, ice. Generative landscapes from the edge of the Arctic circle.", location: "Tromsø", focus: ["image", "video", "audio"], tools: ["Imagen", "Veo", "Stable Audio"], verified: false, followers: 49_100, following: 190, palette: 2 },
  { username: "ghostinthemodel", name: "Marcus Bell", headline: "Glitch & horror", bio: "Uncanny, analog, haunted. If it looks like a VHS found in an attic, it's mine 👻", location: "Detroit", focus: ["video", "image", "audio"], tools: ["Runway", "Kling", "Udio"], verified: false, followers: 38_400, following: 111, palette: 9 },
  { username: "softglitch", name: "Yuna Choi", headline: "Pastel pixels", bio: "Soft colors, cute robots, cozy worlds. Stickers & wallpapers weekly 🍡", location: "Busan", focus: ["image", "gallery", "3d"], tools: ["Midjourney", "Niji", "Procreate"], verified: true, followers: 154_200, following: 420, palette: 4 },
  { username: "orbitalart", name: "Kwame Mensah", headline: "Space & sci-fi", bio: "Planets, stations and stellar weather. Making the space posters I wanted as a kid 🚀", location: "Accra", focus: ["image", "video", "3d"], tools: ["FLUX", "Sora", "Blender"], verified: false, followers: 61_000, following: 205, palette: 0 },
  { username: "tinyprompts", name: "Elif Demir", headline: "Prompt minimalist", bio: "Five words or fewer. Constraints make better art. Daily challenge — join in!", location: "Istanbul", focus: ["image", "text", "chat"], tools: ["Ideogram", "Claude"], verified: false, followers: 29_700, following: 980, palette: 10 },
  { username: "rendernights", name: "Lucas Moreau", headline: "Cinematic renders", bio: "Moody frames, anamorphic flares, rain-soaked streets. Night owl, obviously.", location: "Paris", focus: ["image", "video"], tools: ["Midjourney", "Veo"], verified: true, followers: 112_800, following: 143, palette: 11 },
  { username: "muse.machine", name: "Nora Fischer", headline: "Music × visuals", bio: "Album art + the album. AI-assisted electronic music and the visuals to match.", location: "Vienna", focus: ["audio", "image", "video"], tools: ["Suno", "Stable Audio", "Midjourney"], verified: false, followers: 44_300, following: 367, palette: 7 },
  { username: "diffusiondiaries", name: "Omar Farouk", headline: "Learning in public", bio: "Documenting my journey from zero to AI artist. Before/after, failures included.", location: "Cairo", focus: ["image", "chart", "text"], tools: ["Stable Diffusion", "ComfyUI"], verified: false, followers: 18_200, following: 1204, palette: 5 },
  { username: "pastelbots", name: "Chloe Martin", headline: "Character designer", bio: "Friendly robots and their tiny adventures. Merch soon 🤖💗", location: "Montréal", focus: ["image", "3d", "gallery"], tools: ["Niji", "Meshy"], verified: false, followers: 52_600, following: 318, palette: 4 },
  { username: "neuralnomad", name: "Ravi Iyer", headline: "Postcards from imaginary places", bio: "Travel photos from places that don't exist. Remote dev by day.", location: "Goa", focus: ["image", "video", "code"], tools: ["FLUX", "Kling", "Claude Code"], verified: false, followers: 26_400, following: 455, palette: 1 },
  { username: "lumen.ai", name: "Isla Murphy", headline: "Light studies", bio: "Obsessed with how light falls. Studies in glass, water and haze.", location: "Dublin", focus: ["image", "3d", "video"], tools: ["Midjourney", "Luma"], verified: true, followers: 92_100, following: 233, palette: 6 },
  { username: "glitchgarden", name: "Zara Ali", headline: "Digital botanist", bio: "Growing gardens out of noise. Flowers, fungi and fractal ferns 🌿", location: "Karachi", focus: ["image", "gallery", "code"], tools: ["Stable Diffusion", "Processing"], verified: false, followers: 33_800, following: 512, palette: 3 },
];

export const SUBJECTS = [
  { t: "Neon Lighthouse", p: "a lonely lighthouse at the edge of a neon-lit ocean, waves made of light", tags: ["seascape", "neon"] },
  { t: "Orbital Greenhouse", p: "a botanical greenhouse orbiting a gas giant, ferns pressed against the glass", tags: ["scifi", "botanical"] },
  { t: "Paper Dragons", p: "origami dragons flying over a paper city at dawn", tags: ["origami", "fantasy"] },
  { t: "Desert Cathedral", p: "a cathedral carved into red desert dunes, sunbeams through sandstone arches", tags: ["architecture", "desert"] },
  { t: "Tokyo After Rain", p: "a quiet Tokyo alley after rain, vending machines reflected in puddles", tags: ["city", "night"] },
  { t: "Glass Jellyfish", p: "bioluminescent glass jellyfish drifting through a midnight reef", tags: ["ocean", "macro"] },
  { t: "The Last Library", p: "an endless spiral library floating in the clouds, a tiny reader at the center", tags: ["fantasy", "architecture"] },
  { t: "Chrome Bloom", p: "liquid chrome flowers blooming in slow motion against a pastel sky", tags: ["abstract", "3drender"] },
  { t: "Moonlit Fox", p: "a fox made of moonlight walking through a snowy birch forest", tags: ["animals", "winter"] },
  { t: "Retro Future Diner", p: "a 1960s retro-futurist diner on Mars, astronauts drinking milkshakes", tags: ["retrofuturism", "scifi"] },
  { t: "Coral Metropolis", p: "an underwater megacity grown from coral and light", tags: ["ocean", "city"] },
  { t: "Solarpunk Market", p: "a bustling solarpunk market with hanging gardens and wind sails", tags: ["solarpunk", "city"] },
  { t: "Velvet Storm", p: "a slow storm of velvet ribbons over a perfectly calm lake", tags: ["abstract", "surreal"] },
  { t: "Clockwork Owl", p: "an intricate clockwork owl perched on a stack of old books", tags: ["steampunk", "animals"] },
  { t: "Aurora Train", p: "a night train crossing a frozen valley under a vivid aurora", tags: ["landscape", "night"] },
  { t: "Cloud Whales", p: "a pod of giant whales swimming through sunset clouds", tags: ["surreal", "animals"] },
  { t: "Bauhaus Dreams", p: "a bold Bauhaus poster of geometric shapes in primary colors", tags: ["poster", "geometric"] },
  { t: "Lantern Festival", p: "thousands of paper lanterns rising over an ancient river town", tags: ["festival", "night"] },
  { t: "Crystal Cavern", p: "a hidden cavern of glowing amethyst crystals around a still pool", tags: ["fantasy", "landscape"] },
  { t: "Portrait in Static", p: "a portrait dissolving into analog TV static and color bars", tags: ["portrait", "glitch"] },
  { t: "Tiny Planet Café", p: "an isometric tiny planet with a cozy café and a single tree", tags: ["isometric", "cozy"] },
  { t: "Silk Road Nebula", p: "a caravan crossing a desert under a swirling violet nebula", tags: ["space", "desert"] },
  { t: "Mycelium Network", p: "glowing mycelium threads connecting a forest floor, macro view", tags: ["nature", "macro"] },
  { t: "Brutalist Sunrise", p: "a brutalist concrete tower catching the first pink sunrise light", tags: ["architecture", "minimal"] },
];

export const STYLES = [
  { s: "cinematic, 35mm film grain, anamorphic flare", tag: "cinematic" },
  { s: "risograph print, limited palette, halftone texture", tag: "risograph" },
  { s: "isometric diorama, soft clay render", tag: "isometric" },
  { s: "ukiyo-e woodblock print", tag: "ukiyoe" },
  { s: "dreamy pastel watercolor", tag: "watercolor" },
  { s: "hyperreal macro photography, shallow depth of field", tag: "photography" },
  { s: "vaporwave, chrome and gradients", tag: "vaporwave" },
  { s: "storybook gouache painting", tag: "gouache" },
  { s: "minimalist vector illustration", tag: "vector" },
  { s: "octane render, volumetric light", tag: "3drender" },
];

export const MODIFIERS = [
  "golden hour", "volumetric light", "ultra detailed", "soft rim light", "moody atmosphere",
  "high contrast", "dreamy haze", "symmetrical composition", "long exposure", "muted tones",
];

export const CAMERA_MOVES = ["slow dolly-in", "drone flyover", "orbit shot", "handheld tracking shot", "timelapse", "crane shot"];

export const CAPTIONS = [
  "Spent way too long iterating on this one. Prompt is in the details — remix it and tag me ✨",
  "Still can't believe this came out of a single prompt.",
  "New series dropping all week. Which one is your favorite?",
  "Testing the limits of {model}. Thoughts?",
  "Seed {seed}. Don't ask how many rerolls.",
  "Made this on my lunch break 🍜",
  "Inspired by a dream I had last night.",
  "Pushing color and composition this week. Feedback welcome!",
  "Behind the scenes: 40+ iterations, 3 upscales, 1 happy accident.",
  "Free prompt for anyone who wants it 👇",
  "This one feels like a memory I never had.",
  "Couldn't stop tweaking the lighting on this one.",
  "Part {n} of an ongoing experiment. Following along?",
  "Sometimes the model surprises you. This was one of those times.",
];

export const TEXTS = [
  { title: "Ode to the Latent Space", form: "Poem", prompt: "Write a short poem about where AI images come from", tags: ["poetry"], body: "Somewhere between the noise and the name,\na thousand unborn pictures wait —\nnot lost, just not yet asked for.\n\nI whisper twelve words into the dark\nand the dark, politely,\nhands me a sunrise." },
  { title: "The Cartographer's Daughter", form: "Micro-fiction", prompt: "A 60-word story about maps of the future", tags: ["microfiction"], body: "Her father mapped coastlines that no longer existed. She mapped the ones that hadn't happened yet.\n\nEvery evening they compared notes over tea, and every evening the sea moved a little closer to her version." },
  { title: "Instructions for a Robot Learning to Garden", form: "Poem", prompt: "A poem written as instructions to a gardening robot", tags: ["poetry", "robots"], body: "Water what is thirsty, not what is loud.\nCount the bees, but do not keep the number.\nWhen a seed refuses you, wait.\nWhen a weed blooms, wait longer —\nyou may have the definition wrong." },
  { title: "Last Message from the Lighthouse", form: "Micro-fiction", prompt: "Flash fiction: a lighthouse keeper's final log entry", tags: ["microfiction"], body: "Keeper's log, day 4,019.\n\nThe ships stopped coming years ago, but I keep the light on. Tonight something blinked back from the horizon. Three short, three long, three short.\n\nI have never been so happy to be asked for help." },
  { title: "Haiku for a GPU", form: "Haiku", prompt: "A haiku from the perspective of a graphics card", tags: ["haiku", "poetry"], body: "fans hum like the sea —\nten thousand small suns compute\none quiet daisy" },
  { title: "The Museum of Almost", form: "Micro-fiction", prompt: "Describe a museum of things that almost happened", tags: ["microfiction", "surreal"], body: "In the Museum of Almost, every exhibit is a thing that nearly happened: the letter not sent, the turn not taken, the song you hummed once and forgot.\n\nAdmission is free. Leaving is harder." },
  { title: "On Prompting", form: "Essay", prompt: "A tiny essay on what makes a good prompt", tags: ["essay", "prompting"], body: "A good prompt is less a command than an invitation. You set the table — light, mood, a few precise nouns — and leave one chair empty for surprise.\n\nThe best work I've made came from that empty chair." },
  { title: "Night Shift", form: "Poem", prompt: "A poem about someone training a model late at night", tags: ["poetry"], body: "The city sleeps in sodium light.\nOne window hums: a lamp, a screen,\na person teaching a machine\nthe difference between dusk and blue." },
  { title: "Seven Words", form: "Micro-fiction", prompt: "A story about a lost sentence recovered by AI", tags: ["microfiction", "scifi"], body: "The archive held every word ever written except seven. Scholars spent centuries guessing.\n\nWhen the machine finally reconstructed them, they read: \"I was here. I loved it. Goodbye.\"" },
  { title: "Small Weather", form: "Poem", prompt: "A forecast poem where the weather is a person", tags: ["poetry", "love"], body: "Today the forecast is mostly you:\nscattered laughter by noon,\na light drizzle of old songs,\nclearing by evening into something like peace." },
];

export const CODES = [
  {
    title: "Generative flow field in 30 lines",
    filename: "flowfield.js",
    language: "javascript",
    prompt: "Write a tiny canvas flow-field sketch with rainbow strokes",
    tags: ["creativecoding", "generative"],
    source: `const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const { width: w, height: h } = canvas;

// the angle at any point comes from layered sine "noise"
const field = (x, y) =>
  Math.sin(x * 0.004) * Math.cos(y * 0.006) * Math.PI * 2;

for (let i = 0; i < 2000; i++) {
  let x = Math.random() * w;
  let y = Math.random() * h;
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (let step = 0; step < 80; step++) {
    const a = field(x, y);
    x += Math.cos(a) * 2;
    y += Math.sin(a) * 2;
    ctx.lineTo(x, y);
  }
  ctx.strokeStyle = \`hsla(\${(x / w) * 360}, 80%, 60%, 0.08)\`;
  ctx.stroke();
}`,
  },
  {
    title: "The infinite-scroll hook I use everywhere",
    filename: "useInfiniteScroll.ts",
    language: "typescript",
    prompt: "A minimal React hook for infinite scrolling with IntersectionObserver",
    tags: ["react", "webdev"],
    source: `import { useEffect, useRef } from "react";

export function useInfiniteScroll(onLoadMore: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && onLoadMore(),
      { rootMargin: "800px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [onLoadMore]);

  return ref;
}`,
  },
  {
    title: "Prompt matrix generator",
    filename: "prompt_matrix.py",
    language: "python",
    prompt: "Generate every combination of subject, style and lighting as prompts",
    tags: ["python", "prompting"],
    source: `from itertools import product

subjects = ["lighthouse", "greenhouse", "night market"]
styles = ["risograph", "ukiyo-e", "isometric clay"]
lighting = ["golden hour", "neon rain", "overcast"]

def build(subject, style, light):
    return f"a {subject}, {style} style, {light} lighting"

prompts = [build(*combo) for combo in product(subjects, styles, lighting)]

for i, prompt in enumerate(prompts, 1):
    print(f"{i:02d}. {prompt}")

# 27 prompts, one batch, zero guesswork`,
  },
  {
    title: "Plasma shader, explained line by line",
    filename: "plasma.frag",
    language: "glsl",
    prompt: "A classic plasma fragment shader with smooth cosine palette",
    tags: ["shaders", "generative"],
    source: `precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * 0.4;

  // three interfering sine waves
  float v = sin(uv.x * 10.0 + t)
          + sin((uv.y * 10.0 + t) * 0.5)
          + sin((uv.x * 6.0 + uv.y * 8.0 + t) * 0.7);

  // cosine palette: shift each channel by a phase
  vec3 col = 0.5 + 0.5 * cos(v + vec3(0.0, 2.0, 4.0));
  gl_FragColor = vec4(col, 1.0);
}`,
  },
  {
    title: "Top creators by engagement (SQL)",
    filename: "top_creators.sql",
    language: "sql",
    prompt: "SQL to rank creators by engagement over the last 30 days",
    tags: ["sql", "data"],
    source: `-- Top creators by engagement (last 30 days)
SELECT
  u.username,
  COUNT(p.id)                     AS posts,
  SUM(p.likes + p.comments * 3)   AS engagement,
  ROUND(SUM(p.likes) * 1.0 / SUM(p.views), 3) AS like_rate
FROM posts p
JOIN users u ON u.id = p.author_id
WHERE p.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.username
ORDER BY engagement DESC
LIMIT 10;`,
  },
  {
    title: "Extract a color palette from any image",
    filename: "palette.ts",
    language: "typescript",
    prompt: "Quantize pixels into buckets and return the dominant colors",
    tags: ["typescript", "color"],
    source: `type RGB = [number, number, number];

export function palette(pixels: RGB[], size = 5): string[] {
  const buckets = new Map<string, { rgb: RGB; count: number }>();
  for (const [r, g, b] of pixels) {
    // quantize to 32 levels per channel
    const key = \`\${r >> 3},\${g >> 3},\${b >> 3}\`;
    const hit = buckets.get(key);
    if (hit) hit.count++;
    else buckets.set(key, { rgb: [r, g, b], count: 1 });
  }
  return [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, size)
    .map(({ rgb }) => "#" + rgb.map((c) => c.toString(16).padStart(2, "0")).join(""));
}`,
  },
  {
    title: "Pure CSS aurora background",
    filename: "aurora.css",
    language: "css",
    prompt: "An animated aurora gradient background using only CSS",
    tags: ["css", "webdesign"],
    source: `.aurora {
  position: relative;
  overflow: hidden;
  background: #05010d;
}

/* three blurred blobs drifting slowly */
.aurora::before {
  content: "";
  position: absolute;
  inset: -50%;
  background:
    radial-gradient(40% 30% at 30% 40%, #7c3aedaa, transparent 70%),
    radial-gradient(35% 25% at 70% 60%, #06b6d4aa, transparent 70%),
    radial-gradient(30% 30% at 50% 20%, #f472b6aa, transparent 70%);
  filter: blur(40px);
  animation: drift 12s ease-in-out infinite alternate;
}

@keyframes drift {
  to { transform: rotate(20deg) scale(1.2); }
}`,
  },
  {
    title: "A tiny tokenizer in Rust",
    filename: "tokenizer.rs",
    language: "rust",
    prompt: "Write a minimal tokenizer in Rust that splits words, numbers and punctuation",
    tags: ["rust", "compilers"],
    source: `#[derive(Debug)]
enum Token { Word(String), Number(f64), Punct(char) }

fn tokenize(input: &str) -> Vec<Token> {
    let mut tokens = Vec::new();
    let mut chars = input.chars().peekable();
    while let Some(&c) = chars.peek() {
        if c.is_whitespace() {
            chars.next();
        } else if c.is_ascii_digit() {
            let mut n = String::new();
            while let Some(&d) = chars.peek() {
                if d.is_ascii_digit() || d == '.' { n.push(d); chars.next(); } else { break; }
            }
            tokens.push(Token::Number(n.parse().unwrap()));
        } else if c.is_alphabetic() {
            let mut w = String::new();
            while let Some(&a) = chars.peek() {
                if a.is_alphanumeric() { w.push(a); chars.next(); } else { break; }
            }
            tokens.push(Token::Word(w));
        } else {
            tokens.push(Token::Punct(c));
            chars.next();
        }
    }
    tokens
}`,
  },
];

export const CHATS: { title: string; tags: string[]; messages: ChatMessage[] }[] = [
  {
    title: "Planned a 3-day Kyoto trip on a tiny budget",
    tags: ["travel", "planning"],
    messages: [
      { role: "user", text: "I have 3 days in Kyoto and about $300 for everything except the hotel. Make it feel special, not touristy." },
      { role: "ai", text: "Love it. Here's a plan built around early mornings — free, empty, magical:\n\nDay 1 — Fushimi Inari at 6am, hike past the crowds to the summit. Standing soba for lunch (~$8).\nDay 2 — Rent a bike (~$10) and follow the Kamo River to the Philosopher's Path.\nDay 3 — Kurama to Kibune mountain hike, then an onsen (~$12)." },
      { role: "user", text: "What's one thing most people miss?" },
      { role: "ai", text: "Nishiki Market right before closing. Vendors discount what's left, the crowds are gone, and you can actually talk to the people who've run those stalls for generations." },
      { role: "user", text: "Saving this forever 🙏" },
    ],
  },
  {
    title: "Rubber-ducking a race condition with AI",
    tags: ["webdev", "debugging"],
    messages: [
      { role: "user", text: "My search box sometimes shows results for an older query. Typing fast makes it worse." },
      { role: "ai", text: "Classic race: responses arrive out of order, so a slow old request overwrites a fast new one. Two fixes:\n1. Abort the previous request with AbortController when the query changes.\n2. Tag each request with an id and ignore any response that isn't the latest." },
      { role: "user", text: "Option 1 worked. Why didn't debouncing fix it?" },
      { role: "ai", text: "Debouncing reduces how many requests you send, but not the order they come back in. It's a rate limit, not a guarantee." },
    ],
  },
  {
    title: "Naming my coffee shop with AI",
    tags: ["branding", "naming"],
    messages: [
      { role: "user", text: "Opening a tiny coffee shop next to a bookstore. Need a name: cozy, a little nerdy." },
      { role: "ai", text: "A few directions:\n• Footnote — the small thing that makes it better\n• Dog-Ear Coffee — for the pages you come back to\n• Second Draft — everyone deserves one\n• Marginalia — for people who write in books" },
      { role: "user", text: "Footnote is perfect. Tagline?" },
      { role: "ai", text: "\"Footnote — worth the detour.\"" },
    ],
  },
  {
    title: "Explain transformers like I'm 10",
    tags: ["learning", "ml"],
    messages: [
      { role: "user", text: "Explain how a transformer works like I'm 10." },
      { role: "ai", text: "Imagine reading a sentence with a magic highlighter. For every word, it asks: \"Which other words help me understand this one?\"\n\nIn \"The cat sat on the mat because it was tired\", the word \"it\" highlights \"cat\" really brightly. That's called attention.\n\nA transformer does this for every word, many times over — then guesses the next word." },
      { role: "user", text: "So it's just guessing?" },
      { role: "ai", text: "Very, very educated guessing — after reading more text than a person could in a thousand lifetimes." },
    ],
  },
  {
    title: "Turned my messy notes into a study plan",
    tags: ["learning", "productivity"],
    messages: [
      { role: "user", text: "Exam in 10 days: linear algebra. I get stuck on eigenvectors and panic on proofs." },
      { role: "ai", text: "A 10-day plan that front-loads your weak spots:\nDays 1–3 — eigenvectors: pictures first, formulas second.\nDays 4–6 — proof patterns: direct, contradiction, induction.\nDays 7–8 — mixed past papers under time.\nDay 9 — review mistakes only.\nDay 10 — rest. Seriously." },
      { role: "user", text: "Day 10 made me laugh but okay 😅" },
      { role: "ai", text: "Sleep is when your brain files everything you learned. It's studying, just lying down." },
    ],
  },
  {
    title: "Writing my sister's wedding toast",
    tags: ["writing", "life"],
    messages: [
      { role: "user", text: "Help me write a 1-minute toast for my sister's wedding. She's a chaotic genius, he's the calmest person alive." },
      { role: "ai", text: "\"For 28 years I watched my sister run toward every idea at full speed — usually carrying three coffees and a plan B she hadn't told anyone about. Then she met Daniel, the only person I know who stays calm in an airport. Together they make perfect sense: she brings the adventure, he brings the map. Please raise your glasses to the best team I know.\"" },
      { role: "user", text: "I'm crying already" },
    ],
  },
  {
    title: "Dinner from whatever's left in my fridge",
    tags: ["cooking", "life"],
    messages: [
      { role: "user", text: "I have eggs, half a cabbage, rice, soy sauce and one sad carrot. Go." },
      { role: "ai", text: "Charred cabbage fried rice with a jammy egg:\n1. Shred cabbage and carrot thin; fry hot until the edges char.\n2. Add cold rice, press flat, let it crisp for 2 minutes.\n3. Pour soy sauce around the edge of the pan so it sizzles.\n4. Top with a 6½-minute egg.\n\n15 minutes, one pan." },
      { role: "user", text: "Made it. Better than takeout." },
    ],
  },
];

export const CHARTS: (Omit<ChartSpec, "values"> & { title: string; prompt: string; base: number; cumulative?: boolean; tags: string[] })[] = [
  { title: "My weekly generations", type: "bar", labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], base: 120, prompt: "Chart how many images I generated each day this week from my export log", tags: ["data", "workflow"] },
  { title: "Follower growth, last 12 weeks", type: "line", labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"], base: 900, cumulative: true, prompt: "Plot my follower growth week over week", tags: ["growth", "data"] },
  { title: "Where my creative time goes", type: "donut", labels: ["Prompting", "Curating", "Editing", "Posting"], base: 30, unit: "h", prompt: "Break down my weekly hours by activity", tags: ["workflow", "productivity"] },
  { title: "Best hours to post (avg. likes)", type: "bar", labels: ["6a", "9a", "12p", "3p", "6p", "9p", "12a"], base: 800, prompt: "Which posting hour gets the most likes on average?", tags: ["growth", "data"] },
  { title: "Prompt length vs. like rate", type: "line", labels: ["5", "10", "20", "40", "80", "160"], base: 4, unit: "%", prompt: "Does prompt length correlate with like rate? Words on the x-axis", tags: ["prompting", "data"] },
  { title: "Monthly AI tool spend", type: "donut", labels: ["Image", "Video", "Music", "Text"], base: 25, unit: "$", prompt: "Visualize my subscription spend by category", tags: ["budget", "data"] },
  { title: "Engagement by format", type: "bar", labels: ["Image", "Video", "Music", "Code", "Text"], base: 1000, prompt: "Compare average engagement across the formats I post", tags: ["growth", "data"] },
];

export const TRACKS = [
  { t: "Midnight Tokens", genre: "Lo-fi", mood: "nostalgic late-night" },
  { t: "Neon Rain", genre: "Synthwave", mood: "driving retro" },
  { t: "Gradient Descent", genre: "Ambient", mood: "slow evolving" },
  { t: "Paper Moons", genre: "Dream pop", mood: "hazy romantic" },
  { t: "Overfit Heart", genre: "Indie electronic", mood: "bittersweet upbeat" },
  { t: "Latent Bloom", genre: "Downtempo", mood: "warm organic" },
  { t: "Signal & Noise", genre: "Drum & bass", mood: "energetic rolling" },
  { t: "Warm Weights", genre: "Neo-soul", mood: "smooth intimate" },
  { t: "Cathedral of Static", genre: "Ambient", mood: "vast reverent" },
  { t: "Tiny Robots Dancing", genre: "Chiptune", mood: "playful bright" },
  { t: "Blue Hour Loop", genre: "Jazzhop", mood: "mellow rainy" },
  { t: "Starfield Lullaby", genre: "Cinematic", mood: "gentle epic" },
];

export const INSTRUMENTS = ["dusty Rhodes", "warm analog bass", "vinyl crackle", "airy vocals", "glassy arpeggios", "808s", "brushed drums", "string pads", "kalimba"];

export const KEYS = ["C minor", "D major", "E♭ major", "F minor", "G major", "A minor", "B♭ major"];

export const OBJECTS_3D: { t: string; p: string; shape: "sphere" | "cube" | "atom"; tags: string[] }[] = [
  { t: "Crystal Gyroscope", p: "a floating crystal gyroscope with orbiting rings, glass material", shape: "sphere", tags: ["product", "glass"] },
  { t: "Holo Cube", p: "a holographic cube nested inside a wireframe cube, iridescent", shape: "cube", tags: ["abstract", "hologram"] },
  { t: "Pocket Atom", p: "a toy-like atom model with glowing electron orbits", shape: "atom", tags: ["science", "toy"] },
  { t: "Wireframe Planet", p: "a wireframe planet with emissive latitude rings", shape: "sphere", tags: ["space", "wireframe"] },
  { t: "Glass Puzzle Box", p: "a frosted glass puzzle box under studio lighting", shape: "cube", tags: ["product", "glass"] },
  { t: "Orbit Lamp", p: "a designer lamp made of intersecting rings of light", shape: "atom", tags: ["design", "lighting"] },
  { t: "Moon Lantern", p: "a paper lantern shaped like the moon, low poly", shape: "sphere", tags: ["lowpoly", "cozy"] },
  { t: "Data Crystal", p: "a translucent data-storage crystal with an inner glow", shape: "cube", tags: ["scifi", "crystal"] },
];

export const COMMENTS = [
  "This is unreal 🔥", "The colors!!", "Mind sharing the negative prompt?", "Saved for inspo ✨",
  "How many iterations did this take?", "Remixing this right now", "The composition is so clean",
  "Teach us your ways 🙏", "This belongs in a gallery", "Okay this is my new wallpaper",
  "Wait, this is AI?!", "The lighting is perfect", "You never miss", "Need a full series of this",
  "Following for more like this", "This made my morning", "Can't stop looking at the details",
  "Bookmarking the prompt, thank you!", "The vibe is immaculate", "Every day you raise the bar",
  "Tried the prompt — mine looks nothing like this 😂", "What upscaler do you use?",
];

export const AUTHOR_REPLIES = [
  "Thank you so much! 🙏", "Prompt is in the details — go wild", "More of this series coming this week!",
  "Haha thank you, this one took forever", "Appreciate you! Tag me if you remix it",
];
