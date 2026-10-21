export interface SlopHit {
  rule: string;
  line: number;
  text: string;
}

const RULES: [rule: string, pattern: RegExp][] = [
  ["gradient", /\b(linear|radial|conic)-gradient\(/],
  ["glass", /backdrop-filter\s*:/],
  ["gradient-text", /background-clip\s*:\s*text/],
  ["glow", /(box|text)-shadow\s*:\s*0(px)?\s+0(px)?\s+[1-9]\d+px/],
  ["emoji", /\p{Emoji_Presentation}|️/u],
  [
    "word",
    /\b(seamless(ly)?|elevate|unlock|delve|supercharge\w*|effortless(ly)?|game-?changer|revolutioni[sz]\w*|cutting-edge|empower\w*|unleash\w*|next-level|harness)\b/i,
  ],
  ["not-just", /\b(not just|isn't just|more than just)\b/i],
  ["tailwind-indigo", /#(6366f1|4f46e5|8b5cf6|7c3aed|a855f7|9333ea)\b/i],
];

const COMMENT_ONLY = /^\s*(\/\*.*\*\/|<!--.*-->|\/\/.*)\s*$/;

/** A line containing `slop-ok` opts out, so every exception is visible in
 * review. A comment-only `slop-ok` line also covers the line below it, since
 * formatters move trailing comments off wrapped declarations. */
export function findSlop(source: string): SlopHit[] {
  const lines = source.split("\n");
  return lines.flatMap((text, index) => {
    if (text.includes("slop-ok")) return [];
    const above = lines[index - 1] ?? "";
    if (above.includes("slop-ok") && COMMENT_ONLY.test(above)) return [];
    return RULES.filter(([, pattern]) => pattern.test(text)).map(([rule]) => ({
      rule,
      line: index + 1,
      text: text.trim(),
    }));
  });
}
