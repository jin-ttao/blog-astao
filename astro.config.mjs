// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://as-tao.com",
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/projects"),
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: "github-dark",
      wrap: true
    },
  },
});
