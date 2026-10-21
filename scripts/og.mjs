// Renders the 1200x630 link-preview card to public/og.png from the live
// themes, so it stays in step with them. Rerun after adding or recolouring a
// theme. Usage: npm run og -- [url]   (expects `npm run preview` running)
import { chromium } from "playwright-core";

const url = process.argv[2] ?? "http://localhost:4321/";
const out = new URL("../public/og.png", import.meta.url).pathname;

const browser = await chromium.launch({
  executablePath: process.env.CHROME ?? "/usr/bin/google-chrome",
});
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.goto(url, { waitUntil: "networkidle" });

const themes = await page.$$eval(".theme-dot", (dots) =>
  dots.map((dot) => {
    dot.dataset.scheme = "light";
    const style = getComputedStyle(dot);
    return {
      name: dot.dataset.tip,
      bg: style.getPropertyValue("--bg").trim(),
      accent: style.getPropertyValue("--accent").trim(),
      line: style.getPropertyValue("--line-strong").trim(),
    };
  }),
);
const count = await page.$$eval(".spec", (specs) => specs.length);

const font = (family, file, weight) =>
  `@font-face{font-family:"${family}";font-weight:${weight};src:url("${new URL(`/fonts/${file}`, url)}") format("woff2")}`;

const chip = ({ name, bg, accent, line }) =>
  `<li><span class="dot" style="background:${bg};box-shadow:inset 0 0 0 2px ${line}">` +
  `<span style="background:${accent}"></span></span>${name}</li>`;
const chips = themes.map(chip).join("");

await page.setContent(`<!doctype html><html><head><style>
  ${font("Instrument Serif", "instrument-serif-latin-400.woff2", 400)}
  ${font("Inter Tight", "inter-tight-latin-var.woff2", "100 900")}
  ${font("DM Mono", "dm-mono-400-latin.woff2", 400)}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px; height: 630px; padding: 72px 80px;
    display: flex; flex-direction: column;
    background: oklch(0.99 0.002 260); color: oklch(0.21 0.012 260);
    font-family: "Inter Tight", sans-serif;
  }
  h1 { font: 400 168px/0.9 "Instrument Serif", serif; letter-spacing: -0.01em; }
  p { margin-top: 28px; font-size: 38px; line-height: 1.25; color: oklch(0.45 0.014 260); max-width: 900px; }
  ul { margin-top: auto; display: flex; gap: 36px; list-style: none; font-size: 26px; }
  li { display: flex; align-items: center; gap: 12px; }
  .dot { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; }
  .dot span { width: 12px; height: 12px; border-radius: 50%; }
  footer { margin-top: 40px; padding-top: 24px; border-top: 2px solid oklch(0.9 0.006 260);
    display: flex; justify-content: space-between; font: 400 22px "DM Mono", monospace; color: oklch(0.45 0.014 260); }
</style></head><body>
  <h1>idiom</h1>
  <p>Plain HTML and CSS interface elements, with a copy button on each.</p>
  <ul>${chips}</ul>
  <footer><span>idiom.dannybrown.dev</span><span>${count} elements · ${themes.length} themes</span></footer>
</body></html>`);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out });
await browser.close();
console.log(out);
