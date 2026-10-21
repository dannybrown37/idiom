import { describe, expect, it } from "vitest";
import { type SearchEntry, search } from "./search";

const entries: SearchEntry[] = [
  { id: "buttons-button", title: "Button", group: "Buttons" },
  { id: "buttons-icon-button", title: "Icon button", group: "Buttons" },
  { id: "inputs-text-field", title: "Text field", group: "Inputs" },
  { id: "surfaces-tooltip", title: "Tooltip", group: "Surfaces" },
  { id: "inputs-textarea", title: "Textarea", group: "Inputs" },
  { id: "theme-patch", title: "Patch", group: "Themes", terms: "deluge.quest" },
];

const ids = (query: string) => search(entries, query).map((e) => e.id);

describe("search", () => {
  it("returns everything, in order, for an empty query", () => {
    expect(ids("  ")).toEqual(entries.map((e) => e.id));
  });

  it("ranks a title prefix above a later word match", () => {
    expect(ids("butt")).toEqual(["buttons-button", "buttons-icon-button"]);
  });

  it.each<[string, string[]]>([
    ["TEXT", ["inputs-text-field", "inputs-textarea"]],
    ["text f", ["inputs-text-field"]],
    ["inputs", ["inputs-text-field", "inputs-textarea"]],
    ["deluge", ["theme-patch"]],
    ["ip", []],
    ["zzz", []],
  ])("matches %j", (query: string, expected: string[]) => {
    expect(ids(query)).toEqual(expected);
  });

  it("ranks a title match above a group-only match", () => {
    expect(ids("t")).toEqual([
      "inputs-text-field",
      "surfaces-tooltip",
      "inputs-textarea",
      "theme-patch",
    ]);
  });
});
