export type Status = "draft" | "approved";

export interface ElementDef {
  slug: string;
  title: string;
  status: Status;
  note?: string;
  /** Ids ("category/slug") of elements whose CSS or JS this one builds on. */
  requires?: string[];
}

export interface CategoryDef {
  id: string;
  title: string;
  elements: ElementDef[];
}

export interface CatalogElement extends ElementDef {
  id: string;
  html: string;
  css: string;
  js: string;
  /** Requirements, then this element, as one paste-ready block. */
  snippet: string;
}

export interface CatalogCategory {
  id: string;
  title: string;
  elements: CatalogElement[];
}

const ELEMENT_FILE = /([^/]+)\/([^/]+)\.(html|css|js)$/;

function byKey(files: Record<string, string>): Map<string, string> {
  const map = new Map<string, string>();
  for (const [path, source] of Object.entries(files)) {
    const match = ELEMENT_FILE.exec(path);
    if (match) map.set(`${match[1]}/${match[2]}`, source);
  }
  return map;
}

export function buildCatalog(
  defs: CategoryDef[],
  htmlFiles: Record<string, string>,
  cssFiles: Record<string, string>,
  jsFiles: Record<string, string> = {},
): CatalogCategory[] {
  const html = byKey(htmlFiles);
  const css = byKey(cssFiles);
  const js = byKey(jsFiles);
  const claimed = new Set<string>();

  const catalog: CatalogCategory[] = defs.map((category) => ({
    id: category.id,
    title: category.title,
    elements: category.elements.map((def) => {
      const id = `${category.id}/${def.slug}`;
      if (claimed.has(id)) throw new Error(`Duplicate element: ${id}`);
      claimed.add(id);
      const source = html.get(id);
      if (source === undefined) {
        throw new Error(`Missing src/elements/${id}.html`);
      }
      return {
        ...def,
        id,
        html: source,
        css: css.get(id) ?? "",
        js: js.get(id) ?? "",
        snippet: "",
      };
    }),
  }));

  const orphans = [...html.keys()].filter((key) => !claimed.has(key));
  if (orphans.length > 0) {
    throw new Error(`Unlisted element files: ${orphans.join(", ")}`);
  }

  const byId = new Map(
    catalog.flatMap((category) => category.elements).map((e) => [e.id, e]),
  );
  for (const element of byId.values()) {
    element.snippet = snippet(withRequirements(element, byId));
  }
  return catalog;
}

/** Depth-first, so every requirement lands before whatever needs it. */
function withRequirements(
  root: CatalogElement,
  byId: Map<string, CatalogElement>,
): CatalogElement[] {
  const ordered: CatalogElement[] = [];
  const visiting = new Set<string>();
  const visit = (element: CatalogElement) => {
    if (ordered.includes(element)) return;
    if (visiting.has(element.id)) {
      throw new Error(`Requirement cycle through ${element.id}`);
    }
    visiting.add(element.id);
    for (const id of element.requires ?? []) {
      const required = byId.get(id);
      if (!required) {
        throw new Error(`${element.id} requires unknown element ${id}`);
      }
      visit(required);
    }
    visiting.delete(element.id);
    ordered.push(element);
  };
  visit(root);
  return ordered;
}

function labelled(
  parts: CatalogElement[],
  pick: (element: CatalogElement) => string,
): string {
  return parts
    .filter((element) => pick(element).trim() !== "")
    .map((element) => `/* ${element.id} */\n${pick(element).trim()}\n`)
    .join("\n");
}

function snippet(parts: CatalogElement[]): string {
  const self = parts[parts.length - 1];
  const css = labelled(parts, (element) => element.css);
  const js = labelled(parts, (element) => element.js);
  return [
    css && `<style>\n${css}</style>\n`,
    `${self.html.trim()}\n`,
    js && `<script type="module">\n${js}</script>\n`,
  ]
    .filter(Boolean)
    .join("\n");
}
