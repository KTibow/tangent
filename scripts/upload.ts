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

  // Process handler.js
  if (normalizedPath === "handler.js") {
    let processedContent = content;
    processedContent = processedContent.replace("\n\t\tserve_prerendered(),", "");
    processedContent = processedContent.replace(
      `function createReadableStream(file) {
\treturn /** @type {ReadableStream} */ (Readable.toWeb(createReadStream(file)));
}`,
      `function createReadableStream(file) {
throw new Error("ruh roh someone finally decided to use serverside fetch");
}`,
    );
    processedContent = `import { readFile } from "https://esm.town/v/std/utils/index.ts";
${processedContent}`;
    processedContent = processedContent.replace(
      "const dir = path.dirname(fileURLToPath(import.meta.url))",
      'const dir = "."',
    );
    processedContent = processedContent.replace(
      "get_raw_body(request, bodySizeLimit)",
      "request.body",
    );
    processedContent = processedContent.replace(
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
      const result = await transform(processedContent, {
        platform: "node",
        target: "deno2",
        format: "esm",
        treeShaking: true,
        minifySyntax: true,
      });
      processedContent = result.code;
    }

    return { content: processedContent, fileType: "file" };
  }

  // Process server/index.js
  if (normalizedPath === "server/index.js") {
    // Apply esbuild transformations (matching original vite.config.ts behavior)
    const result = await transform(content, {
      platform: "node",
      target: "deno2",
      format: "esm",
      treeShaking: true,
      minifySyntax: true,
      minifyWhitespace: true,
      minifyIdentifiers: true,
    });

    return { content: result.code, fileType: "file" };
  }

  // Process index.js (convert to Val Town HTTP val)
  if (normalizedPath === "index.js") {
    const valTownContent = js`import { handler } from './handler.js';
import { EventEmitter } from 'node:events';

export default async function(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    // Create a proper mock response that implements the Node.js response interface
    const mockRes = Object.assign(new EventEmitter(), {
      statusCode: 200,
      statusMessage: 'OK',
      headers: {},
      headersSent: false,
      finished: false,

      writeHead(statusCode, statusMessage, headers) {
        if (typeof statusMessage === 'object') {
          headers = statusMessage;
          statusMessage = undefined;
        }
        this.statusCode = statusCode;
        if (statusMessage) this.statusMessage = statusMessage;
        if (headers) Object.assign(this.headers, headers);
        this.headersSent = true;
      },

      setHeader(name, value) {
        this.headers[name] = value;
      },

      getHeader(name) {
        return this.headers[name];
      },

      removeHeader(name) {
        delete this.headers[name];
      },

      write(chunk) {
        if (chunk) {
          chunks.push(chunk);
        }
        return true;
      },

      end(chunk) {
        if (chunk) chunks.push(chunk);
        this.finished = true;

        // Combine all chunks into a single buffer/string
        let body = '';
        for (const chunk of chunks) {
          if (typeof chunk === 'string') {
            body += chunk;
          } else if (chunk instanceof Uint8Array || Buffer.isBuffer(chunk)) {
            body += new TextDecoder().decode(chunk);
          } else {
            body += String(chunk);
          }
        }
        if (!body) body = undefined;

        resolve(new Response(body, {
          status: this.statusCode,
          statusText: this.statusMessage,
          headers: this.headers
        }));
      }
    });

    // Create a proper mock request
    const url = new URL(req.url);
    const mockReq = {
      method: req.method,
      url: url.pathname + url.search,
      headers: Object.fromEntries(req.headers.entries()),
      httpVersion: '1.1',
      httpVersionMajor: 1,
      httpVersionMinor: 1,
      connection: { encrypted: req.url.startsWith('https:') },
      socket: { encrypted: req.url.startsWith('https:') }
    };

    // Handle body for POST requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      req.arrayBuffer().then(buffer => {
        mockReq.body = new Uint8Array(buffer);
        handler(mockReq, mockRes);
      }).catch(reject);
    } else {
      handler(mockReq, mockRes);
    }

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!mockRes.finished) {
        reject(new Error('Request timeout'));
      }
    }, 30000);
  });
}`;

    return { content: valTownContent, fileType: "http" };
  }

  // Return content unchanged for other files
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
