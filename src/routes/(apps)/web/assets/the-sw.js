importScripts("WEB_ASSET(scramjet.all.js)");

const scramjet = new ScramjetServiceWorker();

/**
 * Handles incoming fetch requests, routing them through UV if applicable
 * @param {FetchEvent} event - The fetch event to handle
 * @returns {Promise<Response>} The response from either UV or direct fetch
 */
async function handleRequest(event) {
  await scramjet.loadConfig();

  if (new URL(event.request.url).pathname != "/" && scramjet.route(event)) {
    return await scramjet.fetch(event);
  }

  return await fetch(event.request);
}

self.addEventListener("install", () => {
  self.skipWaiting(); // Forces immediate activation
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim()); // Takes control of existing pages
});

self.addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});
