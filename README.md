# idiom

My UI library: plain HTML and CSS elements that read only theme tokens, with
several themes to switch between. The site shows every element live with its
code and a copy button.

## Themes

| Theme | Used on |
|---|---|
| Folio | [dannybrown.dev](https://dannybrown.dev) |
| Patch | [deluge.quest](https://deluge.quest) |
| Matinee | [hamilhamilhamil.com](https://hamilhamilhamil.com) |
| Brick | [maadgoat.com](https://maadgoat.com) |
| Ink | not yet |
| Footlights | not yet |

On the site, `T` / `Shift+T` cycles themes and `D` cycles light, dark and
system.

## Develop

Node 22 (see `.nvmrc`).

```sh
npm ci
npm run dev       # http://localhost:4321
npm test          # vitest: logic, element rules, slop scan, font licences
npm run check     # biome + tsc
npm run build
npm run shots     # screenshots of every theme (needs `npm run preview` running)
npm run og        # re-render public/og.png, the link preview (same)
```

Hooks: `prek install` (or `pre-commit install`), then `prek run --all-files`.

## License

Code: [MIT](LICENSE). Fonts in `public/fonts`: SIL Open Font License 1.1, texts
in `public/fonts/licenses`.
