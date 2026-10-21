const COMMENT = /\/\*[\s\S]*?\*\//g;
const RAW_COLOUR =
  /#[0-9a-f]{3,8}\b|\b(rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(|:\s*(white|black)\b/gi;

/** Element CSS may only reach colour through theme tokens. */
export function findRawColours(css: string): string[] {
  return css.replace(COMMENT, "").match(RAW_COLOUR) ?? [];
}

const ICON_BUTTON = /<button\b[^>]*class="[^"]*\bicon-btn\b[^"]*"[^>]*>/g;

export function findUnlabelledIconButtons(html: string): string[] {
  return (html.match(ICON_BUTTON) ?? []).filter(
    (tag) => !tag.includes("aria-label="),
  );
}

/** Classes the markup uses that no selector in the given CSS defines. */
export function findUnstyledClasses(html: string, css: string): string[] {
  const selectors = css.replace(COMMENT, "");
  const used = new Set(
    [...html.matchAll(/\bclass="([^"]*)"/g)].flatMap(([, list]) =>
      list.split(/\s+/).filter(Boolean),
    ),
  );
  return [...used].filter(
    (name) => !new RegExp(`\\.${name}(?![\\w-])`).test(selectors),
  );
}

/** Every demo shares one page, so ids and label targets must be unique across all of them. */
export function findDuplicateIds(sources: string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const source of sources) {
    for (const [, id] of source.matchAll(/\bid="([^"]+)"/g)) {
      if (seen.has(id)) dupes.add(id);
      seen.add(id);
    }
  }
  return [...dupes];
}
