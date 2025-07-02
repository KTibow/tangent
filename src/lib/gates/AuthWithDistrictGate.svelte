<script lang="ts">
  import { LoadingIndicator } from "m3-svelte";
  import districts from "school-districts";
  import type { Snippet } from "svelte";
  import { send } from "$lib/sdk/comms-app";
  import { AUTH_PATH, getStorage } from "$lib/sdk/storage";

  const storage = getStorage();
  let auth = $derived(storage[AUTH_PATH]);
  let authInDistrict = $derived.by(() => {
    const domain = auth && JSON.parse(auth).email.split("@")[1];
    return domain && domain in districts;
  });

  let { children }: { children: Snippet } = $props();
</script>

{#if !storage.ready}
  <LoadingIndicator />
{:else if !auth}
  {send!({ type: "launch", name: "Authorization", popup: true })}
  <h1 class="m3-font-display-large">
    Authorize<br />to<br />use<br />this<br />app.
  </h1>
{:else if !authInDistrict}
  <h1 class="m3-font-display-large">
    Unfortunately,<br />your district<br />is not<br />supported<br /><a
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
