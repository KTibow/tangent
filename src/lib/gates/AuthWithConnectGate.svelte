<script lang="ts">
  import { LoadingIndicator } from "m3-svelte";
  import type { Snippet } from "svelte";
  import { send } from "$lib/sdk/comms-app";
  import { AUTH_PATH, getStorage } from "$lib/sdk/storage";
  import { require } from "./check";

  const storage = getStorage();
  let auth = $derived(storage[AUTH_PATH]);

  let { children }: { children: Snippet } = $props();
</script>

{#if !storage.ready}
  <LoadingIndicator />
{:else if !auth}
  {send!({ type: "launch", name: "Authorization", popup: true })}
  <h1 class="m3-font-display-large">
    Authorize<br />to<br />use<br />this<br />app.
  </h1>
{:else if !require(storage, "connection")}
  <h1 class="m3-font-display-large">
    Unfortunately,<br />Tangent can't<br />connect to<br />your district<br /><a
      href="https://github.com/KTibow/school-districts">(yet)</a
    >.
  </h1>
{:else}
  {@render children()}
{/if}

<style>
  h1 {
    margin: 1.5rem;
    font-size: 17dvh;
  }
  a {
    color: rgb(var(--m3-scheme-primary));
  }
</style>
