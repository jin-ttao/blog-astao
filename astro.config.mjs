// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://as-tao.com",
  markdown: {
    shikiConfig: {
      theme: "github-dark",
      wrap: true
    },
  },
});
