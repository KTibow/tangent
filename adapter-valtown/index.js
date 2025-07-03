import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { build } from "npm:esbuild";

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

      // Write server files to temp directory
      builder.writeServer(tmp);

      // Generate manifest
      writeFileSync(
        `${tmp}/manifest.js`,
        `export const manifest = ${builder.generateManifest({
          relativePath: "./",
        })};

export const base_path = ${JSON.stringify(builder.config.kit.paths.base)};
`,
      );

      // Bundle server files with esbuild
      builder.log.minor("Bundling server");
      builder.mkdirp(`${out}/server`);

      await build({
        entryPoints: [`${tmp}/index.js`, `${tmp}/manifest.js`],
        outdir: `${out}/server`,
        format: "esm",
        splitting: true,
        bundle: true,
        minify: true,
        treeShaking: true,
        chunkNames: "chunks/[name]-[hash]",
      });

      // Copy HTTP val entry point
      builder.copy(`${files}/index.js`, `${out}/index.js`, {
        replace: {
          SERVER: "./server/index.js",
          MANIFEST: "./server/manifest.js",
        },
      });

      builder.log.minor("Generated Val Town HTTP handler");
    },

    supports: {
      read: () => true,
    },
  };
}
