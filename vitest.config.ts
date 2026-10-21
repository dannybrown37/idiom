import { defineConfig } from "vitest/config";

// Vitest stubs CSS imports to "" by default; the catalog tests need the real
// ?raw element sources to check what a copied snippet contains.
export default defineConfig({
  test: { css: { include: /.+/ } },
});
