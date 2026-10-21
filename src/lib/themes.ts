export type Scheme = "light" | "dark";

const COMMENT = /\/\*[\s\S]*?\*\//g;

function declarations(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    out[name] = value.trim();
  }
  return out;
}

/** A theme file's tokens per scheme; dark inherits whatever it doesn't set. */
export function readTheme(css: string): Record<Scheme, Record<string, string>> {
  const source = css.replace(COMMENT, "");
  const block = (selector: RegExp) => {
    const match = selector.exec(source);
    return match ? declarations(match[1]) : {};
  };
  const light = block(/\[data-palette="[\w-]+"\]\s*\{([^}]*)\}/);
  const dark = block(
    /\[data-palette="[\w-]+"\]\[data-scheme="dark"\]\s*\{([^}]*)\}/,
  );
  return { light, dark: { ...light, ...dark } };
}
