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
if (addEventListener && send) {
  addEventListener("keyup", (e) => {
    if (e.key == "Alt") {
      send({ type: "keyup-alt" });
    }
  });
  addEventListener("mousemove", (e) => {
    send({
      type: "mousemove",
      x: e.pageX,
      y: e.pageY,
    });
  });
  send({ type: "ready" });
}
