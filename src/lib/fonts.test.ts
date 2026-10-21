import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..", "..");
const css = readFileSync(join(ROOT, "src/styles/fonts.css"), "utf8");
const families = [
  ...new Set([...css.matchAll(/font-family:\s*"([^"]+)"/g)].map((m) => m[1])),
];

describe("bundled fonts", () => {
  it("declares at least one family", () => {
    expect(families.length).toBeGreaterThan(0);
  });

  // The OFL requires its text to ship alongside the font files.
  it.each(families)("%s ships with its licence", (family: string) => {
    const slug = family.toLowerCase().replaceAll(" ", "-");
    expect(
      existsSync(join(ROOT, "public/fonts/licenses", `${slug}-OFL.txt`)),
    ).toBe(true);
  });
});
