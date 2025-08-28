import { DISCORD_KEY } from "$env/static/private";

const loadFetch = async (): Promise<typeof fetch> => {
  // @ts-expect-error you're not val town
  if (Deno.env.get("VAL_TOWN_API_KEY")) {
    // @ts-expect-error you're not val town
    const { fetch } = await import("https://esm.town/v/std/fetch");
    return fetch;
  } else {
    return fetch;
  }
};
export const webhook = async (url: string, body: any) => {
  const fetchUsed = await loadFetch();
  const r = await fetchUsed(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    console.error(await r.text());
    throw new Error(`Discord's ${r.status}ing`);
  }
};
export default async <T>(path: string, init: RequestInit = {}) => {
  const fetchUsed = await loadFetch();
  const r = await fetchUsed(`https://discord.com/api/v10/${path}`, {
    ...init,
    headers: {
      ...init.headers,
      authorization: `Bot ${DISCORD_KEY}`,
    },
  });
  if (!r.ok) {
    console.error(await r.text());
    throw new Error(`${path}'s ${r.status}ing`);
  }
  return (await r.json()) as T;
};
