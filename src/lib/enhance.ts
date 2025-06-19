import { enhance } from "$app/forms";
import type { SubmitFunction } from "@sveltejs/kit";

export const enhanceWithTransitions = (node: HTMLFormElement, submitFn?: SubmitFunction) =>
  enhance(node, (input) => {
    const result = submitFn?.(input);

    return async (opts) => {
      const shouldTransition = opts.result.type === "success" || opts.result.type === "redirect";

      if (document.startViewTransition && shouldTransition) {
        document.startViewTransition(() => opts.update());
      } else {
        await opts.update();
      }

      if (typeof result === "function") await result(opts);
    };
  });
