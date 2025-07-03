import { Server } from "SERVER";
import { manifest, base_path } from "MANIFEST";

const server = new Server(manifest);
await server.init({ env: Deno.env.toObject() });

const getContentType = (filePath) => {
  const ext = filePath.split(".").at(-1).toLowerCase();
  const mimeTypes = {
    html: "text/html",
    css: "text/css",
    js: "application/javascript",
    json: "application/json",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    woff: "font/woff",
    woff2: "font/woff2",
    ttf: "font/ttf",
    eot: "application/vnd.ms-fontobject",
  };
  return mimeTypes[ext] || "application/octet-stream";
};

export default async function (request) {
  const url = new URL(request.url);

  let pathname = url.pathname;
  pathname = pathname.replace(base_path, "");

  // Handle static assets (anything with a file extension)
  try {
    if (pathname == "/") {
      pathname += "index.html";
    }
    if (!pathname.includes(".")) {
      throw new Error("continue: not valid");
    }

    const url =
      import.meta.url.split("/").slice(0, -1).join("/") +
      "/" +
      (pathname.endsWith(".html") ? "prerendered" : "client") +
      pathname;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${Deno.env.get("valtown")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`continue: asset ${response.status}`);
    }

    const headers = new Headers(response.headers);

    headers.set("content-type", getContentType(pathname));

    // Add immutable cache headers for _app/immutable assets
    if (pathname.includes("/_app/immutable/")) {
      headers.set("cache-control", "public,max-age=31536000,immutable");
    }

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (e) {
    // return Response.json({ e: e.toString() });
  }

  // Handle everything else with SvelteKit SSR
  // try {
  const response = await server.respond(request, {
    platform: {},
    getClientAddress: () => request.headers.get("cf-connecting-ip") || "127.0.0.1",
  });

  return response;
  // } catch (e) {
  //   return new Response("Internal Server Error", { status: 500 });
  // }
}
