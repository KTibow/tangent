const addEventListener = typeof window == "object" && window.addEventListener;
export const listenForMessages =
  addEventListener &&
  ((listener: (data: any) => void) => addEventListener("message", (e) => listener(e.data)));
export const postMessage = typeof parent == "object" && parent.postMessage;
if (addEventListener && postMessage) {
  addEventListener("keyup", (e) => {
    if (e.key == "Alt") {
      postMessage({ type: "keyup-alt" }, "*");
    }
  });
  addEventListener("mousemove", (e) => {
    postMessage(
      {
        type: "mousemove",
        x: e.pageX,
        y: e.pageY,
      },
      "*",
    );
  });
  postMessage({ type: "ready" }, "*");
}
