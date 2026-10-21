import { describe, expect, it } from "vitest";
import { contrastRatio, parseColour, toHex } from "./contrast";

describe("parseColour", () => {
  it.each<[string, string]>([
    ["#fff", "#ffffff"],
    ["#C0392B", "#c0392b"],
    ["#c4942a1a", "#c4942a"],
    ["rgb(23 23 23)", "#171717"],
    ["rgb(23, 23, 23)", "#171717"],
    // Chrome's own conversions of Folio's tokens, read back from a canvas.
    ["oklch(0.99 0.002 260)", "#fbfcfd"],
    ["oklch(0.21 0.012 260)", "#15181e"],
    ["oklch(0.55 0.15 250)", "#0f74c5"],
    ["oklch(0.78 0.13 250)", "#73bdff"],
    ["oklch(52% 0.014 260)", "#646971"],
  ])("reads %s as %s", (input: string, hex: string) => {
    expect(toHex(parseColour(input))).toBe(hex);
  });

  it.each<string>(["var(--text)", "white", "color-mix(in oklab, red, blue)"])(
    "rejects %s",
    (input: string) => {
      expect(() => parseColour(input)).toThrow(input);
    },
  );
});

describe("contrastRatio", () => {
  it.each<[string, string, number]>([
    ["#000000", "#ffffff", 21],
    ["#ffffff", "#000000", 21],
    ["#777777", "#ffffff", 4.48],
    ["#ffffff", "#ffffff", 1],
  ])("%s on %s is %d:1", (fg: string, bg: string, ratio: number) => {
    expect(contrastRatio(parseColour(fg), parseColour(bg))).toBeCloseTo(
      ratio,
      2,
    );
  });
});
