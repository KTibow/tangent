import { SvelteDate } from "svelte/reactivity";

export const now = new SvelteDate();
setInterval(() => {
  now.setTime(Date.now());
}, 1000);
