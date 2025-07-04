import base_path from "BASE_PATH";

let serverPromise = (async () => {
  const [{ Server }, { default: manifest }] = await Promise.all([
    import("SERVER"),
    import("MANIFEST"),
  ]);
  const server = new Server(manifest);
  await server.init({ env: Deno.env.toObject() });
  return server;
})();

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

    const version = import.meta.url.split("@")[1].split("/")[0];
    const etag = `W/"v${version}"`;
    const etagRequest = request.headers.get("if-none-match");
    if (etagRequest && etagRequest == etag) {
      return new Response(null, {
        status: 304,
      });
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

    const headers = new Headers();
    headers.set("content-type", getContentType(pathname));
    headers.set("etag", etag);
    if (pathname.startsWith("/_app/immutable/")) {
      headers.set("cache-control", "public,max-age=31536000,immutable");
    }
    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch {}

  // Handle everything else with SvelteKit SSR
  const server = await serverPromise;
  const response = await server.respond(request, {
    platform: {},
    getClientAddress: () => request.headers.get("cf-connecting-ip") || "127.0.0.1",
  });

  return response;
}
