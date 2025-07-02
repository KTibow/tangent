<script lang="ts">
  import type { Snippet } from "svelte";
  import { send } from "./comms-app";
  import { AUTH_PATH, getStorage } from "./storage";

  const storage = getStorage();
  let auth = $derived(storage[AUTH_PATH]);

  let { children }: { children: Snippet } = $props();
</script>

{#if !storage.ready}
  <!-- Intentionally empty -->
{:else if auth}
  {@render children()}
{:else}
  {send!({ type: "launch", name: "Authorization", popup: true })}
  <h1 class="m3-font-display-large">
    Authorize<br />to<br />use<br />this<br />app.
  </h1>
{/if}

<style>
  h1 {
    margin: 1.5rem;
    font-size: 17dvh;
  }
</style>
