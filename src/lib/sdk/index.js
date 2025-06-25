if (typeof window == "object") {
  const { addEventListener } = window;
  const { style } = document.documentElement;
  const { postMessage } = parent;
  style.setProperty("--top-inset", "calc(env(safe-area-inset-top) + 2rem)");
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
}
