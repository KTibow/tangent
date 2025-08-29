// @ts-nocheck
import type { Plugin } from "vite";

// Note: this plugin only works for build purposes
export default function (): Plugin {
  const assetsPath = "src/routes/(apps)/web/assets",
    assets = ["the-sw.js", "scramjet.all.js", "scramjet.sync.js", "scramjet.wasm.wasm"];

  const assetMap = new Map<string, string>();

  function replaceAssets(content: string): string {
    return content.replace(/"WEB_ASSET\s*\(\s*([^)]+)\s*\)"/g, (_, filename) => {
      // Remove quotes from filename if present
      const cleanFilename = filename.replace(/^["']|["']$/g, "");
      const hashedUrl = assetMap.get(cleanFilename);
      if (!hashedUrl) {
        throw new Error(
          `WEB_ASSET: Could not find asset "${cleanFilename}". Available assets: ${Array.from(assetMap.keys()).join(", ")}`,
        );
      }
      return `"/${hashedUrl}"`;
    });
  }

  return {
    name: "web-assets",

    async generateBundle(_, bundle) {
      // First pass: emit all web assets and build the asset map
      await Promise.all(
        assets.map(async (assetFile) => {
          const assetPath = `${assetsPath}/${assetFile}`;

          const content = assetPath.endsWith("js")
            ? await Deno.readTextFile(assetPath)
            : await Deno.readFile(assetPath);

          const hashedName = this.emitFile({
            type: "asset",
            name: assetFile,
            source: content,
          });

          const finalName = this.getFileName(hashedName);
          assetMap.set(assetFile, finalName);
        }),
      );

      // Second pass: process all emitted assets for WEB_ASSET replacements
      Object.values(bundle).forEach((chunk) => {
        if (chunk.type === "asset" && typeof chunk.source === "string") {
          // Check if this asset contains WEB_ASSET calls
          if (chunk.source.includes("WEB_ASSET(")) {
            try {
              chunk.source = replaceAssets(chunk.source);
            } catch (error) {
              this.error(`Error processing WEB_ASSET in ${chunk.fileName}: ${error}`);
            }
          }
        }

        if (chunk.type === "chunk" && chunk.code.includes("WEB_ASSET(")) {
          try {
            chunk.code = replaceAssets(chunk.code);
          } catch (error) {
            this.error(`Error processing WEB_ASSET in ${chunk.fileName}: ${error}`);
          }
        }
      });
    },

    transformIndexHtml: {
      order: "post",
      handler(html) {
        if (!html.includes("WEB_ASSET(")) {
          return html;
        }

        return replaceAssets(html);
      },
    },
  };
}
