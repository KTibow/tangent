<script lang="ts">
  import type { Snippet } from "svelte";
  import SDK from "$lib/sdk/SDK.svelte";

  let { children }: { children: Snippet } = $props();
</script>

<SDK>
  {@render children()}
</SDK>
