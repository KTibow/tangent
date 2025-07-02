import { json, type RequestHandler } from "@sveltejs/kit";
import OutExecute from "codec/OutExecute";
import { headers } from "codec/_headers";
import { devalueToValue, intarrToB64 } from "$lib/data-conversion";

type ExecuteRequest = {
  action: number;
  data: Uint8Array;
  mobile: Record<string, any>;
  authKey: string;
  id: string;
};

export const POST: RequestHandler = async ({ request }) => {
  const { action, data, mobile, authKey, id }: ExecuteRequest = devalueToValue(
    await request.text(),
  );

  const message = OutExecute({
    requestId: id,
    sessionId: id,
    action,
    data,
  });

  const input = JSON.stringify([
    [mobile.userId, mobile.sourceId, mobile.network],
    [
      id,
      19,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      intarrToB64(message),
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      [null, 2],
    ],
    [id, null, null, null, null, authKey, [null, null, 2024, 6, 26, null, 4, null, 6]],
  ]);

  const response = await fetch(
    "https://instantmessaging-pa.googleapis.com/$rpc/google.internal.communications.instantmessaging.v1.Messaging/SendMessage",
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
