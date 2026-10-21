# idiom

Danny's UI library: plain HTML + CSS elements, multiple swappable themes, shown on an Astro site.

## Layout

- `src/styles/tokens.css`: theme-independent scales (space, type, motion)
- `src/themes/<id>.css`: one palette per file, `[data-palette=id]` light + `[data-scheme=dark]` dark; register in `src/themes/index.ts`
  - Themes are named for their look, not for a site. `usedBy` in `index.ts` lists the sites using each one (shown under the theme name in the intro).
  - `src/lib/themes.test.ts` checks every theme in both schemes: text tokens 4.5:1 on bg/surface (text and muted on sunken too), on-accent on accent 4.5:1, and `--line-strong` 3:1 on bg/surface because control borders use it. Decorative rules use `--line`, which is exempt. Focus rings use `--focus` (defaults to `--accent-ink` in tokens.css), never `--accent`. A site value that fails is changed and listed as a deviation in the theme header.
  - `folio` (dannybrown.dev), `patch` (deluge.quest), `matinee` (hamilhamilhamil.com), `brick` (maadgoat.com) mirror those sites' own tokens. Each file's header lists which values are exact and which are derived; keep them in sync with the source repos.
  - Optional button tokens `--control-weight`, `--control-case`, `--control-tracking` default to Button's own values; only Brick sets them.
- `public/fonts/`: self-hosted woff2, all SIL OFL. Every family needs its licence in `public/fonts/licenses/` (the OFL requires it to travel with the font files).
- `src/elements/<category>/<slug>.html|.css|.js`: one element (`.js` optional, plain browser JS using document-level event delegation); register in `src/elements/index.ts`. List elements it builds on in `requires` (ids like `"buttons/button"`); the card's copy button bundles their CSS/JS first.
- `src/lib/`: tested logic (theme settings, keyboard shortcuts, catalog assembly + copy snippets, slop lint)
- Theme switching: swatch radios in the top bar; `T` / `Shift+T` / `D` shortcuts, ignored in text fields and switchable off in the top bar's keyboard popover, which also lists them (WCAG 2.1.4).
- Search: `src/components/SiteSearch.astro` (dialog + combobox), opened by the top-bar button, `/` or Ctrl/Cmd+K; matching and ranking in `src/lib/search.ts`. Settings live in localStorage `idiom:palette`, `idiom:mode`, `idiom:keys`.

## Rules

- Element CSS reads only semantic tokens (`--bg`, `--surface`, `--accent`, ...). No hex, no theme names.
- New elements are always `status: "draft"`. Only Danny flips one to `"approved"`.
- No AI-isms. `src/lib/slop.test.ts` scans every `.astro/.html/.css/.md` under `src`. A justified exception carries `slop-ok: <reason>` on the line, or in a comment on the line above.
- `src/lib/elements.test.ts` enforces: element CSS uses no raw colours, icon buttons have `aria-label`, ids are unique across all demos (they share one page), and every class in an element's HTML is styled by its own CSS or a `requires` (so a copied snippet is complete). `vitest.config.ts` turns on real CSS loading for this.
- Demo content uses invented names, never real people.
- Accent goes only on what is non-default, primary, or "on".
- `switch.html` turns off Biome's `useAriaPropsForRole`: ARIA in HTML forbids `aria-checked` on a native checkbox, which already exposes its state.

## Commands

- `npm run dev` / `npm run build` / `npm run preview`
- `npm test`: vitest (logic + slop scan)
- `npm run check`: biome + tsc
- `npm run shots -- [url] [outDir]`: every palette x scheme at desktop and phone (needs preview running)
- `npm run og -- [url]`: re-render `public/og.png`, the link-preview card, from the live themes (needs preview running). Rerun after adding or recolouring a theme. Site URL for absolute links is `site` in `astro.config.mjs`.
