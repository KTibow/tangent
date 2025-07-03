import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const files = fileURLToPath(new URL("./files", import.meta.url).href);

export default function (opts = {}) {
  const { out = "build" } = opts;

  return {
    name: "@sveltejs/adapter-valtown",

    async adapt(builder) {
      const tmp = builder.getBuildDirectory("adapter-valtown");

      builder.rimraf(out);
      builder.rimraf(tmp);
      builder.mkdirp(tmp);

      // Copy client assets and prerendered pages
      builder.writeClient(`${out}/client${builder.config.kit.paths.base}`);
      builder.writePrerendered(`${out}/prerendered${builder.config.kit.paths.base}`);

      // Write server files to build/server
      builder.writeServer(`${out}/server`);

      // Generate manifest in build/
      writeFileSync(
        `${out}/manifest.js`,
        `export const manifest = ${builder.generateManifest({
          relativePath: './server/',
        })};

export const base_path = ${JSON.stringify(builder.config.kit.paths.base)};
`,
      );

      // Copy HTTP val entry point
      builder.copy(`${files}/index.js`, `${out}/index.js`, {
        replace: {
          SERVER: './server/index.js',
          MANIFEST: './manifest.js',
        },
      });

      builder.log.minor("Generated Val Town HTTP handler");
    },

    supports: {
      read: () => true,
    },
  };
}
