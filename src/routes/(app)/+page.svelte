<script lang="ts">
  import { setContext } from "svelte";
  import Styling from "$lib/sdk/Styling.svelte";
  import { listen } from "$lib/sdk/comms-tangent";
  import HotCorner from "./HotCorner.svelte";
  import Windows from "./Windows.svelte";

  let overviewing = $state(true);

  const storage: Record<string, string> = $state({});
  setContext("storage", storage);

  listen((data) => {
    if (data.type == "storage-set") {
      const { key, value } = data;
      storage[key] = value;
    } else if (data.type == "storage-delete") {
      const { key } = data;
      delete storage[key];
    }
  });
</script>

<svelte:window
  onclick={overviewing
    ? (e) => {
        const target = e.target as HTMLElement;
        const closest = target.closest("button") || target.closest(".app");
        if (!closest) {
          // They clicked away
          overviewing = false;
        }
      }
    : undefined}
/>
<Styling />
<HotCorner bind:overviewing />
<div class="window-surface" class:overviewing></div>
<Windows bind:overviewing />

<style>
  :root {
    background-color: rgb(var(--m3-scheme-surface-container-lowest));
  }
  .window-surface {
    position: absolute;
    inset: 0;
    background-color: rgb(var(--m3-scheme-primary-container-subtle) / 0.6);
    transition: var(--m3-util-easing-fast);
    &.overviewing {
      border-radius: 4rem;
      scale: 0.89;
      transition: var(--m3-util-easing-fast-spatial);
    }
  }
</style>
