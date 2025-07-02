<script lang="ts">
  import { setContext } from "svelte";
  import { browser } from "$app/environment";
  import { syncObjects } from "$lib/data-management";
  import Styling from "$lib/sdk/Styling.svelte";
  import { listen } from "$lib/sdk/comms-tangent";
  import Windows from "./Windows.svelte";

  let overviewing = $state(true);

  const storage: Record<string, string> = $state({ ready: "yes" });
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

  const syncIn = () => {
    const newStorage =
      localStorage["tangent-storage"] && JSON.parse(localStorage["tangent-storage"]);
    if (!newStorage) return;

    syncObjects(storage, newStorage);
  };
  if (browser) {
    syncIn();
  }
  $effect(() => {
    localStorage["tangent-storage"] = JSON.stringify(storage);
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
<Styling lowest />
<Windows bind:overviewing />
