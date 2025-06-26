import { listenForMessages } from "./common";
import { defaultCSS } from "$lib/const";

if (listenForMessages) {
  const { style } = document.documentElement;
  style.setProperty("--top-inset", "calc(env(safe-area-inset-top) + 2rem)");

  const documentStyle = document.createElement("style");
  documentStyle.innerText = defaultCSS;
  document.head.append(documentStyle);
  listenForMessages((data) => {
    if (data.css) {
      documentStyle.textContent = data.css;
    }
  });
}
