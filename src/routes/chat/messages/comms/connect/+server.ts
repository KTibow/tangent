import type { RequestHandler } from "@sveltejs/kit";
import { headers } from "codec/_headers";

export const POST: RequestHandler = async ({ request }) => {
  const { authKey } = await request.json();

  const response = await fetch(
    "https://instantmessaging-pa.googleapis.com/$rpc/google.internal.communications.instantmessaging.v1.Messaging/ReceiveMessages",
    {
      headers: {
        ...headers,
        "content-type": "application/json+protobuf",
      },
      body: JSON.stringify([
        [
          crypto.randomUUID(),
          null,
          null,
          null,
          null,
          authKey,
          [null, null, 2024, 6, 26, null, 4, null, 6],
        ],
        null,
        null,
        [],
      ]),
      method: "POST",
    },
  );

  return new Response(
    response.body,
    response.status == 200
      ? { headers: { "content-type": "text/event-stream" } }
      : { status: response.status },
  );
};
