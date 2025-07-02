<script lang="ts">
  import { setContext, type Snippet } from "svelte";
  import "./_sdk.css";
  import Styling from "./Styling.svelte";
  import { syncIn, storage } from "./_storage-app.svelte";
  import type { FromTangent } from "./comms";
  import { send } from "./comms-app";

  let { children }: { children: Snippet } = $props();

  setContext("storage", storage);

  const shouldRefocus = (e: KeyboardEvent) => {
    if (e.ctrlKey) return false;
    if (e.altKey) return false;

    const canRefocus =
      e.target == document.body ||
      (e.target instanceof HTMLInputElement && e.target.type == "radio") ||
      (e.target instanceof HTMLInputElement && e.target.type == "checkbox") ||
      e.target instanceof HTMLButtonElement;

    if (e.key == "Enter" && canRefocus) return true;
    if (e.key == "Backspace" && canRefocus) return true;
    if (/^[a-zA-Z0-9'"]$/.test(e.key) && (canRefocus || e.target instanceof HTMLAnchorElement)) {
      return true;
    }

    return false;
  };
</script>

<svelte:window
  onmessage={(e) => {
    const data = e.data as FromTangent;
    if (data.storage) syncIn(data.storage);
  }}
  onkeydown={(e) => {
    if (!shouldRefocus(e)) return;

    const field = document.querySelector("textarea");
    if (field) {
      field.focus();
    }
  }}
  onkeyup={(e) => {
    if (e.key == "Alt") {
      send!({ type: "keyup-alt" });
    }
  }}
  onmousemove={(e) => {
    send!({
      type: "mousemove",
      x: e.pageX,
      y: e.pageY,
    });
  }}
/>
<Styling />
{@render children()}
