import type { FromApp } from "./comms";

export const send =
  typeof parent == "object"
    ? (data: FromApp) => {
        parent.postMessage(data, "*");
      }
    : undefined;
export const requestClose = () => send?.({ type: "close" });
