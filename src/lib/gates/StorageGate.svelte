<script lang="ts">
  import { LoadingIndicator } from "m3-svelte";
  import type { Snippet } from "svelte";
  import { getStorage } from "$lib/sdk/storage";

  let { children }: { children: Snippet } = $props();
  const storage = getStorage();
</script>

{#if storage.ready}
  {@render children()}
{:else}
  <LoadingIndicator />
{/if}
