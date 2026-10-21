import { describe, expect, it } from "vitest";
import {
  type Mode,
  nextMode,
  parseMode,
  parsePalette,
  resolveMode,
} from "./theme";

describe("parseMode", () => {
  it.each<[string | null, Mode]>([
    ["light", "light"],
    ["dark", "dark"],
    ["system", "system"],
    [null, "system"],
    ["", "system"],
    ["DARK", "system"],
  ])("parses %j as %j", (raw: string | null, expected: Mode) => {
    expect(parseMode(raw)).toBe(expected);
  });
});

describe("nextMode", () => {
  it.each<[Mode, Mode]>([
    ["system", "light"],
    ["light", "dark"],
    ["dark", "system"],
  ])("advances %j to %j", (current: Mode, expected: Mode) => {
    expect(nextMode(current)).toBe(expected);
  });
});

describe("resolveMode", () => {
  it.each<[Mode, boolean, "light" | "dark"]>([
    ["light", true, "light"],
    ["dark", false, "dark"],
    ["system", true, "dark"],
    ["system", false, "light"],
  ])(
    "resolves %j with prefersDark=%j to %j",
    (mode: Mode, prefersDark: boolean, expected: "light" | "dark") => {
      expect(resolveMode(mode, prefersDark)).toBe(expected);
    },
  );
});

describe("parsePalette", () => {
  const ids = ["studio", "brass", "ink"] as const;

  it.each<[string | null, string]>([
    ["brass", "brass"],
    ["ink", "ink"],
    [null, "studio"],
    ["", "studio"],
    ["deleted-theme", "studio"],
  ])("parses %j as %j", (raw: string | null, expected: string) => {
    expect(parsePalette(raw, ids)).toBe(expected);
  });
});
