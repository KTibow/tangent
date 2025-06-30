import { text } from "@sveltejs/kit";
import InRegisterPhoneRelay from "codec/InRegisterPhoneRelay";
import OutRegisterPhoneRelay from "codec/OutRegisterPhoneRelay";
import { headers } from "codec/_headers";
import { devalueToValue, intarrToB64, valueToDevalue } from "$lib/data-conversion";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.text();
  const { key }: { key: Uint8Array } = devalueToValue(body);

  const input = OutRegisterPhoneRelay({ data: { ecdsaKeys: { key } } });

  const response = await fetch(
    "https://instantmessaging-pa.googleapis.com/$rpc/google.internal.communications.instantmessaging.v1.Pairing/RegisterPhoneRelay",
    {
      headers: {
        ...headers,
        "content-type": "application/x-protobuf",
      },
      body: input,
      method: "POST",
    },
  );

  const result = InRegisterPhoneRelay(new Uint8Array(await response.arrayBuffer()));

  const out = {
    pairingKey: result.pairingKey.slice(), // TODO remove this once https://github.com/Rich-Harris/devalue/pull/99
    authKeyTemp: intarrToB64(result.authKey.key),
  };
  return text(valueToDevalue(out));
};
