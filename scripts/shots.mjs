// Screenshots every palette x scheme at desktop and phone width.
// Usage: npm run shots -- [url] [outDir]   (expects `npm run preview` running)
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const url = process.argv[2] ?? "http://localhost:4321/";
const out = process.argv[3] ?? "/tmp/idiom-shots";
const modes = ["light", "dark"];
const widths = { desktop: 1440, phone: 390 };

mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME ?? "/usr/bin/google-chrome",
});

const probe = await browser.newPage();
await probe.goto(url);
const palettes = await probe.$$eval('input[name="palette"]', (inputs) =>
  inputs.map((input) => input.value),
);
await probe.close();

for (const palette of palettes) {
  for (const mode of modes) {
    for (const [name, width] of Object.entries(widths)) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        deviceScaleFactor: 1,
      });
      await page.addInitScript(
        ([p, m]) => {
          localStorage.setItem("idiom:palette", p);
          localStorage.setItem("idiom:mode", m);
        },
        [palette, mode],
      );
      await page.goto(url, { waitUntil: "networkidle" });
      const file = `${out}/${palette}-${mode}-${name}.png`;
      await page.screenshot({ path: file, fullPage: name === "desktop" });
      console.log(file);
      await page.close();
    }
  }
}

await browser.close();
