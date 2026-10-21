export type Mode = "system" | "light" | "dark";

const CYCLE: Mode[] = ["system", "light", "dark"];

/** Anything unrecognized, including a missing key, means "follow the OS". */
export function parseMode(raw: string | null): Mode {
  return raw === "light" || raw === "dark" || raw === "system" ? raw : "system";
}

export function nextMode(current: Mode): Mode {
  return CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];
}

export function resolveMode(
  mode: Mode,
  prefersDark: boolean,
): "light" | "dark" {
  if (mode === "system") return prefersDark ? "dark" : "light";
  return mode;
}

/** A stored palette that no longer exists falls back to the first one. */
export function parsePalette(
  raw: string | null,
  ids: readonly string[],
): string {
  return raw !== null && ids.includes(raw) ? raw : ids[0];
}
