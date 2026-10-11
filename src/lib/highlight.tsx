import type { ReactNode } from "react";

/** Tiny dependency-free syntax highlighter — good enough for showcase snippets. */

const KEYWORDS = new Set(
  (
    "const let var function return if else for while import from export default async await new class " +
    "def in of fn mut pub use struct impl match enum type interface extends yield lambda with as " +
    "null true false None True False void float int vec2 vec3 vec4 uniform precision mediump " +
    "SELECT FROM WHERE GROUP BY ORDER LIMIT JOIN ON AND OR NOT DESC ASC COUNT SUM ROUND INTERVAL NOW " +
    "content position background animation transform filter inset overflow"
  ).split(" "),
);

const COMMENT: Record<string, string> = {
  python: "#.*",
  sql: "--.*",
  css: "\\/\\*[\\s\\S]*?\\*\\/",
};

const COLORS = {
  comment: "#8b949e",
  string: "#a5d6ff",
  number: "#79c0ff",
  keyword: "#ff7b72",
  fn: "#d2a8ff",
};

export function highlight(source: string, language: string): ReactNode[] {
  const comment = COMMENT[language] ?? "\\/\\/.*|\\/\\*[\\s\\S]*?\\*\\/";
  const re = new RegExp(
    `(${comment})|("(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\\\n])*'|\`(?:\\\\.|[^\`\\\\])*\`)|\\b(\\d+(?:\\.\\d+)?)\\b|\\b([A-Za-z_]\\w*)\\b(\\s*\\()?`,
    "g",
  );
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  const span = (text: string, color: string, italic = false) => (
    <span key={key++} style={{ color, fontStyle: italic ? "italic" : undefined }}>
      {text}
    </span>
  );
  while ((m = re.exec(source))) {
    if (m.index > last) out.push(source.slice(last, m.index));
    if (m[1]) out.push(span(m[1], COLORS.comment, true));
    else if (m[2]) out.push(span(m[2], COLORS.string));
    else if (m[3]) out.push(span(m[3], COLORS.number));
    else if (m[4]) {
      if (KEYWORDS.has(m[4])) out.push(span(m[4], COLORS.keyword));
      else if (m[5]) out.push(span(m[4], COLORS.fn));
      else out.push(m[4]);
      if (m[5]) out.push(m[5]);
    }
    last = re.lastIndex;
  }
  if (last < source.length) out.push(source.slice(last));
  return out;
}
