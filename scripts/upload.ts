import fs from "node:fs";
import path from "node:path";
import { transform } from "npm:esbuild";

const VAL_TOWN_API_KEY = Deno.env.get("VAL_KEY");
const VAL_ID = "90e4bf82-2766-11f0-86ff-569c3dd06744";
const BUILD_DIR = "./build";

console.log("Starting upload...");

// Processing function that handles file transformations
async function process(
  filePath: string,
  content: string,
): Promise<{ content: string; fileType: string } | undefined> {
  const normalizedPath = filePath.replace(/\\/g, "/");

  // Skip source map files
  if (normalizedPath.endsWith(".js.map")) {
    return undefined; // Don't upload
  }

  const js = (strings: TemplateStringsArray, ...values: string[]) =>
    String.raw({ raw: strings }, ...values);

  // Process index.js (HTTP val entry point)
  if (normalizedPath === "index.js") {
    // The adapter already generates the HTTP val entry point, just mark it as http type
    return { content, fileType: "http" };
  }

  // Process server/index.js
  if (normalizedPath === "server/index.js") {
    const result = await transform(content, {
      platform: "node",
      target: "deno2",
      format: "esm",
      treeShaking: true,
      minifySyntax: true,
      minifyWhitespace: true,
      minifyIdentifiers: true,
    });
    content = result.code;
  }

  // Make sure MCU fits in
  if (content.includes(`specVersion==="2025"`)) {
    content = content.replaceAll(
      `var Variant;(function(Variant2){Variant2[Variant2.MONOCHROME=0]="MONOCHROME",Variant2[Variant2.NEUTRAL=1]="NEUTRAL",Variant2[Variant2.TONAL_SPOT=2]="TONAL_SPOT",Variant2[Variant2.VIBRANT=3]="VIBRANT",Variant2[Variant2.EXPRESSIVE=4]="EXPRESSIVE",Variant2[Variant2.FIDELITY=5]="FIDELITY",Variant2[Variant2.CONTENT=6]="CONTENT",Variant2[Variant2.RAINBOW=7]="RAINBOW",Variant2[Variant2.FRUIT_SALAD=8]="FRUIT_SALAD"})(Variant||(Variant={}));`,
      `var Variant={"0":"MONOCHROME","1":"NEUTRAL","2":"TONAL_SPOT","3":"VIBRANT","4":"EXPRESSIVE","5":"FIDELITY","6":"CONTENT","7":"RAINBOW","8":"FRUIT_SALAD",MONOCHROME:0,NEUTRAL:1,TONAL_SPOT:2,VIBRANT:3,EXPRESSIVE:4,FIDELITY:5,CONTENT:6,RAINBOW:7,FRUIT_SALAD:8};`,
    );
    content = content.replaceAll(
      `function getSpec(specVersion){return specVersion==="2025"?spec2025:spec2021}`,
      "",
    );
    content = content.replaceAll(
      `function getSpec$1(specVersion){return specVersion==="2025"?spec2025$1:spec2021$1}`,
      "",
    );
    content = content.replaceAll(/getSpec\([A-Za-z.]+?\)/g, "spec2025");
    content = content.replaceAll(/getSpec\$1\([A-Za-z.]+?\)/g, "spec2025$1");
    content = content.replaceAll(` platform==="phone"`, " true");
    content = content.replaceAll(`s.platform==="phone"`, "true");
    content = content.replaceAll(`s.platform==="watch"`, "false");
    content = content.replaceAll(`s.variant===Variant.VIBRANT`, "true");
    content = content.replaceAll(/s\.variant===Variant\.[A-Z_]+/g, "false");
    content = content.replaceAll(
      `switch(variant){case Variant.`,
      `switch(Variant.VIBRANT){case Variant.`,
    );
    for (const [k, v] of Object.entries({
      MONOCHROME: 0,
      NEUTRAL: 1,
      TONAL_SPOT: 2,
      VIBRANT: 3,
      EXPRESSIVE: 4,
      FIDELITY: 5,
      CONTENT: 6,
      RAINBOW: 7,
      FRUIT_SALAD: 8,
    })) {
      content = content.replaceAll(`Variant.${k}`, v.toString());
    }
    const result = await transform(content, {
      format: "esm",
      treeShaking: true,
      minify: true,
    });
    content = result.code;
    // await Deno.writeTextFile("debug.js", content);
  }

  // Make sure other files fit in
  if (content.length > 80000) {
    const result = await transform(content, {
      format: "esm",
      treeShaking: true,
      minify: true,
    });
    content = result.code;
  }

  // Return content for other files
  return { content, fileType: "file" };
}

// ======================
// on to actual uploading
// ======================

// Step 1: Clear existing files
console.log("Clearing existing files...");
for (const path of ["client", "server", "prerendered"]) {
  const response = await fetch(
    `https://api.val.town/v2/vals/${VAL_ID}/files?path=${path}&recursive=true`,
    {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${VAL_TOWN_API_KEY}`,
      },
    },
  );
  if (![204, 404].includes(response.status)) {
    throw new Error(`Failed to clear files: ${response.statusText}`);
  }
}

// Step 2: Get all files to upload
type FileToUpload = {
  localPath: string;
  valPath: string;
};

function getAllFiles(dir: string, baseDir: string = dir): FileToUpload[] {
  const files: FileToUpload[] = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else {
      const relativePath = path.relative(baseDir, fullPath);
      files.push({
        localPath: fullPath,
        valPath: relativePath.replace(/\\/g, "/"), // Ensure forward slashes
      });
    }
  }
  return files;
}

const filesToUpload = getAllFiles(BUILD_DIR);
console.log(`Found ${filesToUpload.length} files to upload`);

// Step 3: Upload each file
for (const file of filesToUpload) {
  console.log(`Processing ${file.valPath} (${file.localPath})...`);

  const originalContent = fs.readFileSync(file.localPath, "utf8");

  // Apply processing
  const processed = await process(file.valPath, originalContent);
  if (processed === undefined) {
    console.log(`Skipping ${file.valPath} (filtered out by processing)`);
    continue;
  }

  const { content, fileType } = processed;

  const upload = async (method: string) =>
    await fetch(
      `https://api.val.town/v2/vals/${VAL_ID}/files?path=${encodeURIComponent(file.valPath)}`,
      {
        method: method,
        headers: {
          authorization: `Bearer ${VAL_TOWN_API_KEY}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          content,
          type: fileType,
        }),
      },
    );
  let uploadResponse: Response;
  if (
    file.valPath.startsWith("client") ||
    file.valPath.startsWith("server") ||
    file.valPath.startsWith("prerendered")
  ) {
    uploadResponse = await upload("POST");
  } else {
    uploadResponse = await upload("PUT");
    if (!uploadResponse.ok) {
      uploadResponse = await upload("POST");
    }
  }

  if (!uploadResponse.ok) {
    console.log(await uploadResponse.text());
    console.log(`Failed to upload ${file.valPath}: ${uploadResponse.statusText}`);
    throw new Error("Failure");
  }
}

console.log("Upload complete!");
