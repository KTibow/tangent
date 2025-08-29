import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";
import fixSWHeader from "./vite-plugin-fix-sw-header";
import webAssets from "./vite-plugin-web-assets";

export default defineConfig({
  esbuild: {
    minifyIdentifiers: false,
    legalComments: "none",
  },
  build: {
    assetsInlineLimit: 2048,
  },
  plugins: [sveltekit(), devtoolsJson(), webAssets(), fixSWHeader()],
});
