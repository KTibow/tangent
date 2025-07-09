import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import adapter from "./adapter-valtown/index.js";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),
    alias: {
      codec: "src/routes/(apps)/chat/messages/codec",
    },
  },
};

export default config;
