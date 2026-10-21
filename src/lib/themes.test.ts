import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio, parseColour } from "./contrast";
import { readTheme, type Scheme } from "./themes";

describe("readTheme", () => {
  const css = `
    /* --bg: #000; in a comment */
    [data-palette="x"] { --bg: #fff; --text: #111; }
    [data-palette="x"][data-scheme="dark"] { --bg: #000; }
  `;

  it("reads the light block and ignores comments", () => {
    expect(readTheme(css).light).toEqual({ "--bg": "#fff", "--text": "#111" });
  });

  it("lets dark inherit what it doesn't set", () => {
    expect(readTheme(css).dark).toEqual({ "--bg": "#000", "--text": "#111" });
  });
});

// WCAG 2.2 AA: 4.5:1 for text (1.4.3); 3:1 for focus rings and the borders
// that show where a control is (1.4.11). Control borders use --line-strong.
const TEXT = 4.5;
const RING = 3;
const TEXT_TOKENS = [
  "--text",
  "--text-muted",
  "--text-faint",
  "--accent-ink",
  "--pos",
  "--neg",
];
const PAIRS: [fg: string, bg: string, min: number][] = [
  ...TEXT_TOKENS.flatMap((fg): [string, string, number][] => [
    [fg, "--bg", TEXT],
    [fg, "--surface", TEXT],
  ]),
  ["--text", "--sunken", TEXT],
  ["--text-muted", "--sunken", TEXT],
  ["--on-accent", "--accent", TEXT],
  // --focus defaults to --accent-ink (tokens.css).
  ["--accent-ink", "--bg", RING],
  ["--line-strong", "--bg", RING],
  ["--line-strong", "--surface", RING],
];

const THEMES = join(import.meta.dirname, "..", "themes");
const cases = readdirSync(THEMES)
  .filter((file) => file.endsWith(".css"))
  .flatMap((file) => {
    const theme = readTheme(readFileSync(join(THEMES, file), "utf8"));
    return (["light", "dark"] as Scheme[]).flatMap((scheme) =>
      PAIRS.map(
        ([fg, bg, min]) =>
          [`${file} ${scheme}`, fg, bg, min, theme[scheme]] as const,
      ),
    );
  });

describe("theme contrast", () => {
  it.each(cases)("%s: %s on %s >= %d:1", (_, fg, bg, min, tokens) => {
    const ratio = contrastRatio(
      parseColour(tokens[fg]),
      parseColour(tokens[bg]),
    );
    expect(Number(ratio.toFixed(2))).toBeGreaterThanOrEqual(min);
  });
});
