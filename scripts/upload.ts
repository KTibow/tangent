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

  const js = (strings: TemplateStringsArray) => strings[0];

  // Process index.js (convert to Val Town HTTP val)
  if (normalizedPath === "index.js") {
    const valTownContent = js`import { handler } from "./handler.js";
import { EventEmitter } from "node:events";

export default async function (req) {
  let controller;
  const stream = new ReadableStream({
    start(c) {
      controller = c;
    },
  });

  let statusCode = 200;
  let statusMessage = "OK";
  let headers = {};

  // Create a proper mock response that implements the Node.js response interface
  const mockRes = Object.assign(new EventEmitter(), {
    statusCode: 200,
    statusMessage: "OK",
    headers: {},
    headersSent: false,
    finished: false,

    writeHead(code, message, hdrs) {
      if (typeof message === "object") {
        hdrs = message;
        message = undefined;
      }
      statusCode = code;
      if (message) statusMessage = message;
      if (hdrs) Object.assign(headers, hdrs);
      this.statusCode = code;
      if (message) this.statusMessage = message;
      if (hdrs) Object.assign(this.headers, hdrs);
      this.headersSent = true;
    },

    setHeader(name, value) {
      headers[name] = value;
      this.headers[name] = value;
    },

    getHeader(name) {
      return this.headers[name];
    },

    removeHeader(name) {
      delete headers[name];
      delete this.headers[name];
    },

    write(chunk) {
      if (chunk && controller) {
        if (typeof chunk === "string") {
          controller.enqueue(new TextEncoder().encode(chunk));
        } else if (chunk instanceof Uint8Array || Buffer.isBuffer(chunk)) {
          controller.enqueue(chunk);
        } else {
          controller.enqueue(new TextEncoder().encode(String(chunk)));
        }
      }
      return true;
    },

    end(chunk) {
      if (chunk && controller) {
        if (typeof chunk === "string") {
          controller.enqueue(new TextEncoder().encode(chunk));
        } else if (chunk instanceof Uint8Array || Buffer.isBuffer(chunk)) {
          controller.enqueue(chunk);
        } else {
          controller.enqueue(new TextEncoder().encode(String(chunk)));
        }
      }

      if (controller) {
        controller.close();
      }
      this.finished = true;
    },
  });

  // Create a proper mock request
  const url = new URL(req.url);
  const mockReq = {
    method: req.method,
    url: url.pathname + url.search,
    headers: Object.fromEntries(req.headers.entries()),
    httpVersion: "1.1",
    httpVersionMajor: 1,
    httpVersionMinor: 1,
    connection: { encrypted: req.url.startsWith("https:") },
    socket: { encrypted: req.url.startsWith("https:") },
  };

  // Handle body for POST requests
  if (req.method !== "GET" && req.method !== "HEAD") {
    const buffer = await req.arrayBuffer();
    mockReq.body = new Uint8Array(buffer);
  }

  // Start the handler
  handler(mockReq, mockRes);

  // Return the streaming response immediately
  return new Response(stream, {
    status: statusCode,
    statusText: statusMessage,
    headers,
  });
}
`;

    return { content: valTownContent, fileType: "http" };
  }

  // Process handler.js
  if (normalizedPath === "handler.js") {
    content = content.replace("\n\t\tserve_prerendered(),", "");
    content = content.replace(
      `function createReadableStream(file) {
\treturn /** @type {ReadableStream} */ (Readable.toWeb(createReadStream(file)));
}`,
      `function createReadableStream(file) {
throw new Error("ruh roh someone finally decided to use serverside fetch");
}`,
    );
    content = `import { readFile } from "https://esm.town/v/std/utils/index.ts";
${content}`;
    content = content.replace(
      "const dir = path.dirname(fileURLToPath(import.meta.url))",
      'const dir = "."',
    );
    content = content.replace("get_raw_body(request, bodySizeLimit)", "request.body");
    content = content.replace(
      /function serve[^]+?\n}\n\n\/\//,
      js`
function serve(path, client = false) {
  // Simple hash function for etag generation
  async function simpleHash(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
  }

  // Helper function to determine content type
  function getContentType(filePath) {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const mimeTypes = {
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'json': 'application/json',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'ico': 'image/x-icon',
      'woff': 'font/woff',
      'woff2': 'font/woff2',
      'ttf': 'font/ttf',
      'eot': 'application/vnd.ms-fontobject'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  return async (req, res, next) => {
    const url = new URL(req.url, 'http://localhost');
    let filePath = url.pathname;

    // Remove leading slash and prepend the serve path
    if (filePath.startsWith('/')) {
      filePath = filePath.slice(1);
    }

    // Construct full file path
    const fullPath = path === '.' ? filePath : \`\${path}/\${filePath}\`;

    try {
      // Try to read the file
      const content = await readFile(fullPath, import.meta.url);

      // Generate simple etag from content hash
      const etag = \`W/"\${await simpleHash(content)}"\`;

      // Check if client has matching etag
      const clientEtag = req.headers['if-none-match'];
      if (clientEtag === etag) {
        res.statusCode = 304;
        res.end();
        return;
      }

      // Set headers
      res.setHeader('Content-Type', getContentType(filePath));
      res.setHeader('ETag', etag);

      // Handle caching for immutable assets
      if (client && filePath.startsWith(\`\${manifest.appPath}/immutable/\`)) {
        res.setHeader('cache-control', 'public,max-age=31536000,immutable');
      }

      res.end(content);
    } catch (err) {
      // File doesn't exist or other error, pass to next middleware
      if (next) next();
    }
  };
}

//`,
    );

    // Apply esbuild transformations twice (matching original vite.config.ts behavior)
    for (let i = 0; i < 2; i++) {
      const result = await transform(content, {
        platform: "node",
        target: "deno2",
        format: "esm",
        treeShaking: true,
        minifySyntax: true,
      });
      content = result.code;
    }
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

  // Return content for other files
  return { content, fileType: "file" };
}

// ======================
// on to actual uploading
// ======================

// Step 1: Clear existing files
console.log("Clearing existing files...");
for (const path of ["client", "server"]) {
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
  if (file.valPath.startsWith("client") || file.valPath.startsWith("server")) {
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
