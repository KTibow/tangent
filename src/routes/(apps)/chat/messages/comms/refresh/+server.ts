import { json } from "@sveltejs/kit";
import { headers } from "codec/_headers";
import { devalueToValue, intarrToB64 } from "$lib/data-conversion";
import type { RequestHandler } from "./$types";

type RefreshRequest = {
  id: string;
  timestamp: number;
  signature: Uint8Array;
  authKey: string;
  browser: { userId: number; sourceId: string; network: string };
};

export const POST: RequestHandler = async ({ request }) => {
  const { id, timestamp, signature, authKey, browser }: RefreshRequest = await devalueToValue(
    await request.text(),
  );

  const input = JSON.stringify([
    [id, null, null, null, null, authKey, [null, null, 2024, 6, 26, null, 4, null, 6]],
    [browser.userId, browser.sourceId, browser.network],
    timestamp,
    intarrToB64(signature),
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    [],
    null,
    null,
    2,
  ]);

  const r = await fetch(
    "https://instantmessaging-pa.googleapis.com/$rpc/google.internal.communications.instantmessaging.v1.Registration/RegisterRefresh",
    {
      headers: {
        ...headers,
        "content-type": "application/json+protobuf",
      },
      body: input,
      method: "POST",
    },
  );

  if (!r.ok) {
    throw new Error(`Failed to refresh: ${r.status}`);
  }

  const response: [unknown, [string]] = await r.json();
  if (!response[1]) {
    throw new Error("Invalid response");
  }

  const newKey = response[1][0];

  return json({
    newKey,
    expiry: Date.now() + 1000 * 60 * 60 * 24,
  });
};
