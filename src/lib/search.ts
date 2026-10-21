export interface SearchEntry {
  id: string;
  title: string;
  group: string;
  /** Extra words that should find this entry, e.g. a theme's sites. */
  terms?: string;
}

const words = (text: string) =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

/**
 * Every query word must start some word of the entry. Ranked: title starts
 * with the whole query, then title words cover the query, then the rest
 * (group or extra terms). Ties keep catalog order.
 */
export function search<T extends SearchEntry>(
  entries: T[],
  query: string,
): T[] {
  const q = query.trim().toLowerCase();
  if (q === "") return entries;
  const parts = words(q);
  const covers = (haystack: string[]) =>
    parts.every((part) => haystack.some((word) => word.startsWith(part)));

  const ranked: [rank: number, entry: T][] = [];
  for (const entry of entries) {
    const title = words(entry.title);
    if (
      !covers([...title, ...words(entry.group), ...words(entry.terms ?? "")])
    ) {
      continue;
    }
    const rank = entry.title.toLowerCase().startsWith(q)
      ? 0
      : covers(title)
        ? 1
        : 2;
    ranked.push([rank, entry]);
  }
  return ranked.sort((a, b) => a[0] - b[0]).map(([, entry]) => entry);
}
