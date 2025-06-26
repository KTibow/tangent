<script lang="ts">
  import { setContext } from "svelte";
  import Styling from "$lib/sdk/Styling.svelte";
  import { listen } from "$lib/sdk/comms-tangent";
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
        const closest = target.closest(".no-overview-interaction");
        if (!closest) {
          // They clicked away
          overviewing = false;
        }
      }
    : undefined}
/>
<Styling />
<Windows bind:overviewing />

<style>
  :root {
    background-color: rgb(var(--m3-scheme-surface-container-lowest));
  }
</style>
