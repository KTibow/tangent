import type { FromTangent, FromApp } from "./comms";

const addEventListener = typeof window == "object" && window.addEventListener;

export const listen = addEventListener
  ? (listener: (data: FromTangent) => void) => {
      addEventListener("message", (e) => listener(e.data));
    }
  : undefined;
export const send =
  typeof parent == "object"
    ? (data: FromApp) => {
        parent.postMessage(data, "*");
      }
    : undefined;
export const requestClose = () => send?.({ type: "close" });
send?.({ type: "ready" });
