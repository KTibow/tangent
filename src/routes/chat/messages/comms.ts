// TODO: once SvelteKit remote functions are out, refactor to those
// in the meantime...

import InStreamData from "codec/InStreamData";
import InStreamPair from "codec/InStreamPair";
import type { ActionType } from "codec/OutExecute";
import { valueToDevalue, devalueToValue } from "$lib/data-conversion";

export const DATA_PATH = ".config/gmessages.devalue";

export const register = async (key: Uint8Array) => {
  const r = await fetch("/chat/messages/comms/register", {
    method: "POST",
    body: valueToDevalue({ key }),
  });
  if (!r.ok) throw new Error(`Registering is ${r.status}ing`);
  const out = devalueToValue<{
    pairingKey: Uint8Array;
    authKeyTemp: string;
  }>(await r.text());
  return out;
};

export async function connect(
  authKey: string,
  controller: AbortController,
  callbacks: {
    pair?: (payload: ReturnType<typeof InStreamPair>) => void;
    data?: (
      body: Uint8Array,
      iv: Uint8Array,
      meta: { id: string; requestId: string; action: ActionType },
    ) => void;
  },
) {
  class StreamingJsonParser {
    buffer = "";
    depth = 0;
    onJson: (_: any[]) => void = () => {};

    parseChunk(chunk: string) {
      for (const char of chunk) {
        if (char === "[") {
          this.depth++;
        } else if (char === "]") {
          this.depth--;

          if (this.depth === 2) {
            this.buffer += char;
            this.emit();
          }
        }
        if (this.depth > 2) this.buffer += char;
      }
    }
    emit() {
      try {
        const parsedJson = JSON.parse(this.buffer);
        if (this.onJson) {
          this.onJson(parsedJson);
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
      this.buffer = "";
    }
  }
  type EventType = "unknown" | "gaia" | "pair" | "data";
  const parseEventType = (type: number): EventType => {
    const eventTypes: Record<number, EventType> = {
      7: "gaia",
      14: "pair",
      19: "data",
    };
    return eventTypes[type] || "unknown";
  };

  const response = await fetch("/chat/messages/comms/connect", {
    signal: controller.signal,
    method: "POST",
    body: JSON.stringify({ authKey }),
  });

  const decoder = new TextDecoder("utf-8");
  const parser = new StreamingJsonParser();

  let acks: string[] = [];
  let device: { userId: number; sourceId: string; network: string } | undefined;
  let ackTimeout: ReturnType<typeof setTimeout> | undefined;
  parser.onJson = async (x) => {
    const [, data, heartbeat, ack, start] = x;
    if (data) {
      const event = parseEventType(data[1]);
      const decodedData = atob(data[11]);
      const dataArray = new Uint8Array(decodedData.length);
      for (let i = 0; i < decodedData.length; i++) {
        dataArray[i] = decodedData.charCodeAt(i);
      }

      if (event == "pair") {
        controller.abort();
        console.debug("RX: data -> pair ->", data[11]);
        if (callbacks.pair) callbacks.pair(InStreamPair(dataArray));
      } else if (event == "data") {
        const { requestId, action, encryptedData } = InStreamData(dataArray);
        if (encryptedData) {
          const encryptedBody = encryptedData.slice(0, -48);
          const iv = encryptedData.slice(-48, -32);

          if (callbacks.data) {
            callbacks.data(encryptedBody, iv, { id: data[0], requestId, action });
          }

          acks.push(data[0]);
          device = {
            userId: data[8][0],
            sourceId: data[8][1],
            network: data[8][2],
          };

          if (!ackTimeout) {
            ackTimeout = setTimeout(async () => {
              await fetch("/chat/messages/comms/ack", {
                method: "POST",
                body: JSON.stringify({
                  acks,
                  device,
                  authKey,
                }),
              });
              acks = [];
              ackTimeout = undefined;
            }, 33);
          }
        }
      } else {
        console.warn("RX: data -> weird ->", event);
      }
    } else {
      console.debug(
        "RX:",
        heartbeat ? { heartbeat } : ack ? { ack } : start ? { start } : { wtf: x },
      );
    }
  };

  try {
    for await (const chunk of response.body!) {
      const text = decoder.decode(chunk, { stream: true });
      parser.parseChunk(text);
    }
  } catch (e: any) {
    if (e.name == "AbortError") {
      console.debug("aborting messages");
    } else {
      throw e;
    }
  }
}

export const execute = async (
  action: ActionType,
  data: Uint8Array,
  mobile: { userId: number; sourceId: string; network: string },
  authKey: string,
  id = crypto.randomUUID(),
) => {
  const r = await fetch("/chat/messages/comms/execute", {
    method: "POST",
    body: valueToDevalue({
      action: action,
      data,
      mobile,
      authKey,
      id,
    }),
  });
  if (!r.ok) throw new Error(`Execution is ${r.status}ing`);
};

export const refresh = async (
  id: string,
  timestamp: number,
  signature: Uint8Array,
  authKey: string,
  browser: { userId: number; sourceId: string; network: string },
) => {
  const r = await fetch("/chat/messages/comms/refresh", {
    method: "POST",
    body: valueToDevalue({
      id,
      timestamp,
      signature,
      authKey,
      browser,
    }),
  });
  if (!r.ok) throw new Error(`Refreshing is ${r.status}ing`);
  return (await r.json()) as { newKey: string; expiry: number };
};
