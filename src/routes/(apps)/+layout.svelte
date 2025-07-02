<script lang="ts">
  import SDK from "$lib/sdk/SDK.svelte";

  let { children } = $props();
</script>

<SDK>
  {@render children()}
</SDK>
