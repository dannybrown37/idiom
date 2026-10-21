import { describe, expect, it } from "vitest";
import {
  isTextEntry,
  type KeyInput,
  type Shortcut,
  shortcutFor,
  stepPalette,
  type TargetInput,
} from "./shortcuts";

const key = (k: string, extra: Partial<KeyInput> = {}): KeyInput => ({
  key: k,
  shiftKey: false,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  ...extra,
});

describe("shortcutFor", () => {
  it.each<[string, KeyInput, Shortcut | null]>([
    ["t", key("t"), "next-palette"],
    ["Shift+T", key("T", { shiftKey: true }), "previous-palette"],
    ["caps-lock T", key("T"), "next-palette"],
    ["d", key("d"), "next-mode"],
    ["Shift+D", key("D", { shiftKey: true }), "next-mode"],
    ["Ctrl+T", key("t", { ctrlKey: true }), null],
    ["Cmd+T", key("t", { metaKey: true }), null],
    ["Alt+D", key("d", { altKey: true }), null],
    ["an unbound key", key("x"), null],
    ["/", key("/"), "search"],
    ["Ctrl+K", key("k", { ctrlKey: true }), "search"],
    ["Cmd+K", key("k", { metaKey: true }), "search"],
    ["K alone", key("k"), null],
    ["Alt+K", key("k", { altKey: true }), null],
  ])("maps %s", (_, input: KeyInput, expected: Shortcut | null) => {
    expect(shortcutFor(input)).toBe(expected);
  });
});

describe("isTextEntry", () => {
  const el = (
    tagName: string,
    type?: string,
    editable = false,
  ): TargetInput => ({
    tagName,
    type,
    isContentEditable: editable,
  });

  it.each<[string, TargetInput, boolean]>([
    ["a text input", el("INPUT", "text"), true],
    ["a search input", el("INPUT", "search"), true],
    ["an input with no type", el("INPUT"), true],
    ["a textarea", el("TEXTAREA"), true],
    ["a select", el("SELECT"), true],
    ["a contenteditable div", el("DIV", undefined, true), true],
    ["a radio", el("INPUT", "radio"), false],
    ["a checkbox", el("INPUT", "checkbox"), false],
    ["a range", el("INPUT", "range"), false],
    ["a button", el("BUTTON"), false],
    ["the body", el("BODY"), false],
  ])("treats %s as %j", (_, target: TargetInput, expected: boolean) => {
    expect(isTextEntry(target)).toBe(expected);
  });
});

describe("stepPalette", () => {
  const ids = ["a", "b", "c"];

  it.each<[string, 1 | -1, string]>([
    ["a", 1, "b"],
    ["c", 1, "a"],
    ["a", -1, "c"],
    ["b", -1, "a"],
    ["gone", 1, "a"],
  ])(
    "steps %j by %j to %j",
    (current: string, delta: 1 | -1, expected: string) => {
      expect(stepPalette(current, ids, delta)).toBe(expected);
    },
  );
});
