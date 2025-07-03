import { Server } from "SERVER";
import { manifest, base_path } from "MANIFEST";

const server = new Server(manifest);

export default async function (request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const stripped = pathname.replace(base_path, "");

  // Handle static assets (anything with a file extension)
  if (stripped.includes(".")) {
    try {
      const baseUrl = import.meta.url.split("/").slice(0, -1).join("/");
      let assetUrl;
      
      // Only HTML files go to prerendered, everything else to client
      if (stripped.endsWith(".html")) {
        assetUrl = `${baseUrl}/prerendered${stripped}`;
      } else {
        assetUrl = `${baseUrl}/client${stripped}`;
      }

      const response = await fetch(assetUrl, {
        headers: {
          Authorization: `Bearer ${Deno.env.get("valtown")}`,
        },
      });

      if (response.ok) {
        const headers = new Headers(response.headers);

        // Add immutable cache headers for _app/immutable assets
        if (stripped.includes("/_app/immutable/")) {
          headers.set("cache-control", "public,max-age=31536000,immutable");
        }

        return new Response(response.body, {
          status: response.status,
          headers,
        });
      }
    } catch (e) {
      // Fall through to SSR
    }
  }

  // Handle everything else with SvelteKit SSR
  try {
    const response = await server.respond(request, {
      platform: {},
      getClientAddress: () => request.headers.get("cf-connecting-ip") || "127.0.0.1",
    });

    return response;
  } catch (e) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
