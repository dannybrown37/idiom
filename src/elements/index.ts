import { buildCatalog, type CategoryDef } from "../lib/catalog";

// New elements start as "draft". Only a human review flips one to "approved".
const DEFS: CategoryDef[] = [
  {
    id: "buttons",
    title: "Buttons",
    elements: [
      { slug: "button", title: "Button", status: "approved" },
      { slug: "icon-button", title: "Icon button", status: "approved" },
      {
        slug: "button-group",
        title: "Button group",
        status: "approved",
        requires: ["buttons/button"],
      },
    ],
  },
  {
    id: "inputs",
    title: "Inputs",
    elements: [
      { slug: "text-field", title: "Text field", status: "approved" },
      {
        slug: "textarea",
        title: "Textarea",
        status: "approved",
        requires: ["inputs/text-field"],
      },
      {
        slug: "select",
        title: "Select",
        status: "approved",
        requires: ["inputs/text-field"],
      },
      { slug: "checkbox", title: "Checkbox", status: "approved" },
      {
        slug: "radio",
        title: "Radio",
        status: "approved",
        requires: ["inputs/checkbox"],
      },
      {
        slug: "range",
        title: "Range",
        status: "approved",
        requires: ["inputs/text-field"],
      },
      { slug: "search", title: "Search", status: "approved" },
    ],
  },
  {
    id: "selectors",
    title: "Selectors",
    elements: [
      { slug: "segmented", title: "Segmented control", status: "approved" },
      { slug: "chips", title: "Filter chips", status: "approved" },
    ],
  },
  {
    id: "toggles",
    title: "Toggles",
    elements: [{ slug: "switch", title: "Switch", status: "approved" }],
  },
  {
    id: "feedback",
    title: "Feedback",
    elements: [
      { slug: "notice", title: "Notice", status: "approved" },
      {
        slug: "toast",
        title: "Toast",
        status: "approved",
        requires: ["buttons/button"],
      },
      { slug: "progress", title: "Progress", status: "approved" },
      {
        slug: "spinner",
        title: "Spinner",
        status: "approved",
        requires: ["buttons/button"],
      },
      { slug: "skeleton", title: "Skeleton", status: "approved" },
      {
        slug: "empty-state",
        title: "Empty state",
        status: "approved",
        requires: ["buttons/button"],
      },
    ],
  },
  {
    id: "data",
    title: "Data",
    elements: [
      { slug: "tag", title: "Tag", status: "approved" },
      { slug: "stat", title: "Stat", status: "approved" },
      { slug: "table", title: "Table", status: "approved" },
      { slug: "key-value", title: "Key-value list", status: "approved" },
      { slug: "avatar", title: "Avatar", status: "approved" },
    ],
  },
  {
    id: "navigation",
    title: "Navigation",
    elements: [
      { slug: "tabs", title: "Tabs", status: "approved" },
      { slug: "breadcrumbs", title: "Breadcrumbs", status: "approved" },
      { slug: "pagination", title: "Pagination", status: "approved" },
      {
        slug: "menu",
        title: "Menu",
        status: "approved",
        requires: ["buttons/button"],
      },
    ],
  },
  {
    id: "surfaces",
    title: "Surfaces",
    elements: [
      {
        slug: "dialog",
        title: "Dialog",
        status: "approved",
        requires: ["buttons/button"],
      },
      {
        slug: "tooltip",
        title: "Tooltip",
        status: "approved",
        requires: ["buttons/button"],
      },
      { slug: "accordion", title: "Accordion", status: "approved" },
      { slug: "list-row", title: "List row", status: "approved" },
    ],
  },
  {
    id: "text",
    title: "Text",
    elements: [
      { slug: "link", title: "Link", status: "approved" },
      { slug: "kbd", title: "Keyboard key", status: "approved" },
      { slug: "prose", title: "Prose", status: "approved" },
    ],
  },
];

const html = import.meta.glob<string>("./*/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
});

const css = import.meta.glob<string>("./*/*.css", {
  query: "?raw",
  import: "default",
  eager: true,
});

const js = import.meta.glob<string>("./*/*.js", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const CATALOG = buildCatalog(DEFS, html, css, js);

export const TITLES = new Map(
  CATALOG.flatMap((category) => category.elements).map((element) => [
    element.id,
    element.title,
  ]),
);

export const ELEMENT_COUNT = CATALOG.reduce(
  (total, category) => total + category.elements.length,
  0,
);

export const APPROVED_COUNT = CATALOG.flatMap(
  (category) => category.elements,
).filter((element) => element.status === "approved").length;
