import { onMount } from "svelte";
import type { FromApp, FromTangent } from "./comms";

export const listen = (listener: (data: FromApp) => void) => {
  onMount(() => {
    const forward = (e: MessageEvent) => listener(e.data);
    addEventListener("message", forward);
    return () => {
      removeEventListener("message", forward);
    };
  });
};
export const connect = (iframe: HTMLIFrameElement | undefined) => {
  return {
    listen(listener: (data: FromApp) => void) {
      addEventListener("message", (e: MessageEvent) => {
        if (e.source != iframe?.contentWindow) return;
        listener(e.data);
      });
    },
    send(data: FromTangent) {
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(data, "*");
      } else {
        console.warn("Iframe contentWindow is not available.");
      }
    },
  };
};
