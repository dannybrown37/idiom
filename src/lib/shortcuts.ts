export type Shortcut =
  | "next-palette"
  | "previous-palette"
  | "next-mode"
  | "search";

export interface KeyInput {
  key: string;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}

export interface TargetInput {
  tagName: string;
  type?: string;
  isContentEditable: boolean;
}

/** Modified keys belong to the browser and OS (Ctrl+T opens a tab), except
 * Ctrl/Cmd+K, which sites conventionally use for search. */
export function shortcutFor(input: KeyInput): Shortcut | null {
  const key = input.key.toLowerCase();
  if (input.altKey) return null;
  if (input.ctrlKey || input.metaKey) return key === "k" ? "search" : null;
  switch (key) {
    case "/":
      return "search";
    case "t":
      return input.shiftKey ? "previous-palette" : "next-palette";
    case "d":
      return "next-mode";
    default:
      return null;
  }
}

const NON_TEXT_INPUTS = new Set([
  "checkbox",
  "radio",
  "range",
  "color",
  "button",
  "submit",
  "reset",
  "file",
  "image",
]);

export function isTextEntry(target: TargetInput): boolean {
  if (target.isContentEditable) return true;
  if (target.tagName === "TEXTAREA" || target.tagName === "SELECT") return true;
  if (target.tagName !== "INPUT") return false;
  return !NON_TEXT_INPUTS.has((target.type ?? "text").toLowerCase());
}

export function stepPalette(
  current: string,
  ids: readonly string[],
  delta: 1 | -1,
): string {
  const index = ids.indexOf(current);
  if (index === -1) return ids[0];
  return ids[(index + delta + ids.length) % ids.length];
}
