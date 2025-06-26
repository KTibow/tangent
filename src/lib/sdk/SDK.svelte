<script lang="ts">
  import { setContext, type Snippet } from "svelte";
  import { listen } from "./comms-app";
  import "./_sdk.css";
  import Styling from "./Styling.svelte";
  import { storage, handleFullSync } from "./_storage-for-app.svelte";

  let { children }: { children: Snippet } = $props();

  setContext("storage", storage);

  if (listen) {
    listen((data) => {
      if (data.storage) handleFullSync(data.storage);
    });
  }
</script>

<Styling />
{@render children()}
