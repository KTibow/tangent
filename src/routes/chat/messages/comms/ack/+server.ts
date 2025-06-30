import type { RequestHandler } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";
import { headers } from "codec/_headers";

type AckRequest = {
  acks: string[];
  device: {
    userId: number;
    sourceId: string;
    network: string;
  };
  authKey: string;
};

export const POST: RequestHandler = async ({ request }) => {
  const { acks, device, authKey }: AckRequest = await request.json();

  const id = crypto.randomUUID();

  const input = JSON.stringify([
    [id, null, null, null, null, authKey, [null, null, 2024, 6, 26, null, 4, null, 6]],
    null,
    null,
    acks.map((m) => [m, [device.userId, device.sourceId, device.network]]),
  ]);

  const response = await fetch(
    "https://instantmessaging-pa.googleapis.com/$rpc/google.internal.communications.instantmessaging.v1.Messaging/AckMessages",
    {
      headers: {
        ...headers,
        "content-type": "application/json+protobuf",
      },
      body: input,
      method: "POST",
    },
  );
  if (!response.ok) throw new Error(`Google Messages is ${response.status}ing`);

  return json({ ok: true });
};
