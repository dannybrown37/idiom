import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CATALOG } from "../elements";
import {
  findDuplicateIds,
  findRawColours,
  findUnlabelledIconButtons,
  findUnstyledClasses,
} from "./elements";

describe("findRawColours", () => {
  it.each<string>([
    "color: #fff;",
    "background: #1a1a1e;",
    "border-color: rgb(0 0 0);",
    "background: oklch(0.5 0.1 250);",
    "fill: hsl(20 50% 50%);",
    "color: white;",
    "background: black;",
  ])("flags %j", (css: string) => {
    expect(findRawColours(css)).toHaveLength(1);
  });

  it.each<string>([
    "color: var(--text);",
    "background: color-mix(in oklab, var(--accent) 20%, transparent);",
    "fill: currentColor;",
    "background: transparent;",
    "--btn-bg: var(--surface);",
    ".white-space { white-space: nowrap; }",
  ])("passes %j", (css: string) => {
    expect(findRawColours(css)).toEqual([]);
  });

  it("ignores colour words inside comments", () => {
    expect(findRawColours("/* never pure black */")).toEqual([]);
  });
});

describe("findUnlabelledIconButtons", () => {
  it("flags an icon button with no aria-label", () => {
    expect(
      findUnlabelledIconButtons(
        '<button class="icon-btn"><svg></svg></button>',
      ),
    ).toHaveLength(1);
  });

  it("passes an icon button with aria-label", () => {
    expect(
      findUnlabelledIconButtons(
        '<button class="icon-btn" aria-label="Edit"><svg></svg></button>',
      ),
    ).toEqual([]);
  });
});

describe("findUnstyledClasses", () => {
  it.each<[string, string, string[]]>([
    ['<b class="btn btn-s">', ".btn{} .btn-s{}", []],
    ['<b class="btn btn-s">', ".btn{}", ["btn-s"]],
    ['<b class="btn-s">', ".btn-sm{}", ["btn-s"]],
    ['<b class="tag">', "/* .tag */", ["tag"]],
    ['<b class=" a  b ">', ".a, .b:hover {}", []],
  ])(
    "checks %j against %j",
    (html: string, css: string, expected: string[]) => {
      expect(findUnstyledClasses(html, css)).toEqual(expected);
    },
  );
});

describe("findDuplicateIds", () => {
  it("returns ids used more than once across sources", () => {
    expect(
      findDuplicateIds(['<a id="x"></a><b id="y">', '<i id="x">']),
    ).toEqual(["x"]);
  });

  it("returns nothing when ids are unique", () => {
    expect(findDuplicateIds(['<a id="x">', '<a id="y">'])).toEqual([]);
  });
});

const ELEMENTS = join(import.meta.dirname, "..", "elements");
const files = readdirSync(ELEMENTS, { recursive: true, encoding: "utf8" });
const read = (ext: string): [string, string][] =>
  files
    .filter((file) => file.endsWith(ext))
    .map((file) => [file, readFileSync(join(ELEMENTS, file), "utf8")]);

describe("element sources", () => {
  it.each(read(".css"))("%s uses only theme tokens", (_file, source) => {
    expect(findRawColours(source)).toEqual([]);
  });

  it.each(read(".html"))("%s labels every icon button", (_file, source) => {
    expect(findUnlabelledIconButtons(source)).toEqual([]);
  });

  it.each(
    CATALOG.flatMap((category) => category.elements).map(
      (element) => [element.id, element] as const,
    ),
  )("%s copies with every class it uses styled", (_id, element) => {
    const css = element.snippet.split("</style>")[0];
    expect(findUnstyledClasses(element.html, css)).toEqual([]);
  });

  it("uses each id once across the whole page", () => {
    expect(findDuplicateIds(read(".html").map(([, source]) => source))).toEqual(
      [],
    );
  });
});
