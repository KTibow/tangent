import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";
import webAssets from "./vite-plugin-web-assets";

export default defineConfig({
  esbuild: {
    minifyIdentifiers: false,
    legalComments: "none",
  },
  plugins: [sveltekit(), devtoolsJson(), webAssets()],
});
