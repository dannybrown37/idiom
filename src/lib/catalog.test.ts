import { describe, expect, it } from "vitest";
import { buildCatalog, type CategoryDef } from "./catalog";

const defs: CategoryDef[] = [
  {
    id: "buttons",
    title: "Buttons",
    elements: [
      { slug: "button", title: "Button", status: "approved" },
      { slug: "icon-button", title: "Icon button", status: "draft" },
    ],
  },
  {
    id: "feedback",
    title: "Feedback",
    elements: [{ slug: "toast", title: "Toast", status: "draft" }],
  },
];

const html: Record<string, string> = {
  "/src/elements/buttons/button.html": "<button>",
  "/src/elements/buttons/icon-button.html": "<button aria-label>",
  "/src/elements/feedback/toast.html": "<div>",
};

const css: Record<string, string> = {
  "/src/elements/buttons/button.css": ".btn{}",
};

describe("buildCatalog", () => {
  it("attaches html and css by category/slug path", () => {
    const catalog = buildCatalog(defs, html, css);
    expect(catalog[0].elements[0]).toMatchObject({
      id: "buttons/button",
      html: "<button>",
      css: ".btn{}",
    });
  });

  it("accepts the relative keys import.meta.glob produces", () => {
    const relative = Object.fromEntries(
      Object.entries(html).map(([path, source]) => [
        path.replace("/src/elements/", "./"),
        source,
      ]),
    );
    const catalog = buildCatalog(defs, relative, {
      "./buttons/button.css": ".btn{}",
    });
    expect(catalog[0].elements[0]).toMatchObject({
      html: "<button>",
      css: ".btn{}",
    });
  });

  it("allows an element with no css or js file", () => {
    const catalog = buildCatalog(defs, html, css);
    expect(catalog[0].elements[1]).toMatchObject({ css: "", js: "" });
  });

  it("attaches an optional js file", () => {
    const catalog = buildCatalog(defs, html, css, {
      "./feedback/toast.js": "show()",
    });
    expect(catalog[1].elements[0].js).toBe("show()");
  });

  it("throws when an element's html file is missing", () => {
    const { "/src/elements/feedback/toast.html": _, ...missing } = html;
    expect(() => buildCatalog(defs, missing, css)).toThrow(
      "feedback/toast.html",
    );
  });

  it("throws on a duplicate slug within a category", () => {
    const dupe: CategoryDef[] = [
      {
        id: "buttons",
        title: "Buttons",
        elements: [
          { slug: "button", title: "A", status: "draft" },
          { slug: "button", title: "B", status: "draft" },
        ],
      },
    ];
    expect(() => buildCatalog(dupe, html, css)).toThrow("buttons/button");
  });

  it("throws on an orphan html file no definition claims", () => {
    const orphan = { ...html, "/src/elements/buttons/stray.html": "<b>" };
    expect(() => buildCatalog(defs, orphan, css)).toThrow("buttons/stray");
  });

  it.each<[string, string[], string]>([
    ["an unknown element", ["buttons/nope"], "buttons/nope"],
    ["itself", ["a/one"], "a/one"],
  ])("throws when an element requires %s", (_, requires, message) => {
    const bad: CategoryDef[] = [
      {
        id: "a",
        title: "A",
        elements: [{ slug: "one", title: "One", status: "draft", requires }],
      },
    ];
    expect(() => buildCatalog(bad, { "./a/one.html": "<i>" }, {})).toThrow(
      message,
    );
  });

  it("throws on a requirement cycle", () => {
    const cyclic: CategoryDef[] = [
      {
        id: "a",
        title: "A",
        elements: [
          { slug: "one", title: "One", status: "draft", requires: ["a/two"] },
          { slug: "two", title: "Two", status: "draft", requires: ["a/one"] },
        ],
      },
    ];
    const files = { "./a/one.html": "<i>", "./a/two.html": "<b>" };
    expect(() => buildCatalog(cyclic, files, {})).toThrow("cycle");
  });
});

describe("snippet", () => {
  const graph: CategoryDef[] = [
    {
      id: "k",
      title: "Kit",
      elements: [
        { slug: "base", title: "Base", status: "draft" },
        { slug: "left", title: "Left", status: "draft", requires: ["k/base"] },
        {
          slug: "right",
          title: "Right",
          status: "draft",
          requires: ["k/base"],
        },
        {
          slug: "top",
          title: "Top",
          status: "draft",
          requires: ["k/left", "k/right"],
        },
        { slug: "bare", title: "Bare", status: "draft" },
      ],
    },
  ];
  const files = (ext: string, slugs: string[]) =>
    Object.fromEntries(slugs.map((s) => [`./k/${s}.${ext}`, `${s}-${ext}\n`]));
  const all = ["base", "left", "right", "top", "bare"];
  const catalog = buildCatalog(
    graph,
    files("html", all),
    files("css", ["base", "left", "right", "top"]),
    files("js", ["top"]),
  );
  const get = (slug: string) =>
    catalog[0].elements.find((element) => element.slug === slug);

  it("is just the html when an element has no css or js", () => {
    expect(get("bare")?.snippet).toBe("bare-html\n");
  });

  it("wraps css in a style tag and js in a module script", () => {
    expect(get("top")?.snippet).toMatch(
      /^<style>\n[\s\S]*top-css\n<\/style>\n\ntop-html\n\n<script type="module">\n\/\* k\/top \*\/\ntop-js\n<\/script>\n$/,
    );
  });

  it("puts each requirement's css first, once, in dependency order", () => {
    const css = get("top")?.snippet.split("</style>")[0] ?? "";
    expect(css.match(/\/\* k\/\w+ \*\//g)).toEqual([
      "/* k/base */",
      "/* k/left */",
      "/* k/right */",
      "/* k/top */",
    ]);
  });
});
