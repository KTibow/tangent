import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { build } from "npm:esbuild";

const files = fileURLToPath(new URL("./files", import.meta.url).href);

export default function (opts = {}) {
  const { out = "build" } = opts;

  return {
    name: "Val Town",

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

      // Make the actual server
      writeFileSync(
        `${tmp}/manifest.js`,
        `export default ${builder.generateManifest({
          relativePath: "./",
        })};`,
      );
      writeFileSync(
        `${tmp}/base_path.js`,
        `export default ${JSON.stringify(builder.config.kit.paths.base)};`,
      );

      builder.copy(`${files}/index.js`, `${tmp}/val.js`, {
        replace: {
          BASE_PATH: "./base_path.js",
          SERVER: "./index.js",
          MANIFEST: "./manifest.js",
        },
      });

      // Bundle the server
      builder.log.minor("Bundling server");

      await build({
        entryPoints: [`${tmp}/val.js`],
        outdir: out,
        format: "esm",
        splitting: true,
        bundle: true,
        minify: true,
        treeShaking: true,
        chunkNames: "chunks/[name]-[hash]",
      });

      builder.log.minor("Generated Val Town HTTP handler");
    },

    supports: {
      read: () => true,
    },
  };
}
