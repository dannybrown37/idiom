import "./folio.css";
import "./patch.css";
import "./matinee.css";
import "./brick.css";
import "./ink.css";
import "./footlights.css";
import "./nib.css";

export interface Site {
  name: string;
  url: string;
}

export interface Palette {
  id: string;
  name: string;
  /** Sites that use this theme; their tokens are the source of truth. */
  usedBy: Site[];
}

export const PALETTES: Palette[] = [
  {
    id: "folio",
    name: "Folio",
    usedBy: [{ name: "dannybrown.dev", url: "https://dannybrown.dev" }],
  },
  {
    id: "patch",
    name: "Patch",
    usedBy: [{ name: "deluge.quest", url: "https://deluge.quest" }],
  },
  {
    id: "matinee",
    name: "Matinee",
    usedBy: [
      { name: "hamilhamilhamil.com", url: "https://hamilhamilhamil.com" },
    ],
  },
  {
    id: "brick",
    name: "Brick",
    usedBy: [{ name: "maadgoat.com", url: "https://maadgoat.com" }],
  },
  { id: "ink", name: "Ink", usedBy: [] },
  { id: "footlights", name: "Footlights", usedBy: [] },
  { id: "nib", name: "Nib", usedBy: [] },
];

export const PALETTE_IDS = PALETTES.map((palette) => palette.id);
