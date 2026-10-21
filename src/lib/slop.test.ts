import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { findSlop } from "./slop";

describe("findSlop", () => {
  it.each<[string, string]>([
    ["background: linear-gradient(90deg, #6366f1, #a855f7);", "gradient"],
    ["background: linear-gradient(to right, purple, blue);", "gradient"],
    ["backdrop-filter: blur(12px);", "glass"],
    ["-webkit-background-clip: text;", "gradient-text"],
    ["background-clip: text;", "gradient-text"],
    ["box-shadow: 0 0 40px rgba(99, 102, 241, 0.5);", "glow"],
    ["<span>🚀 Launch</span>", "emoji"],
    ["<p>A seamless experience.</p>", "word"],
    ["<p>Elevate your workflow.</p>", "word"],
    ["<p>Unlock the power of tokens.</p>", "word"],
    ["<p>Let's delve into it.</p>", "word"],
    ["<h1>Not just a library, it's a language.</h1>", "not-just"],
    ["color: #6366f1;", "tailwind-indigo"],
  ])("flags %j as %j", (text: string, rule: string) => {
    expect(findSlop(text).map((hit) => hit.rule)).toContain(rule);
  });

  it.each<string>([
    "background: var(--surface);",
    "box-shadow: 3px 3px 0 var(--line-strong);",
    "box-shadow: 0 1px 2px rgb(0 0 0 / 0.08);",
    "<p>Pick a theme, copy what you need.</p>",
    "<p>Copy the HTML and CSS.</p>",
    "transition: translate 80ms var(--ease);",
  ])("passes %j", (text: string) => {
    expect(findSlop(text)).toEqual([]);
  });

  it("reports the 1-based line of each hit", () => {
    expect(findSlop("ok\nok\nbackdrop-filter: blur(4px);")[0].line).toBe(3);
  });

  it("skips lines marked slop-ok", () => {
    expect(
      findSlop("backdrop-filter: blur(4px); /* slop-ok: sheet */"),
    ).toEqual([]);
  });

  it("lets a slop-ok comment line cover the line below it", () => {
    expect(
      findSlop("/* slop-ok: hard-stop fill */\nbackground: linear-gradient("),
    ).toEqual([]);
  });

  it("does not let slop-ok reach two lines down", () => {
    expect(
      findSlop("/* slop-ok: fill */\nok\nbackground: linear-gradient("),
    ).toHaveLength(1);
  });
});

const SCANNED = /\.(astro|html|css|md)$/;
const SKIP = new Set(["node_modules", "dist", ".astro", "lib"]);

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (SKIP.has(entry.name)) return [];
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return SCANNED.test(entry.name) ? [path] : [];
  });
}

describe("repo", () => {
  const root = join(import.meta.dirname, "..");
  const files = walk(root);

  it("scans something", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files.map((file) => [relative(root, file), file]))(
    "%s has no slop",
    (_name: string, file: string) => {
      expect(findSlop(readFileSync(file, "utf8"))).toEqual([]);
    },
  );
});
