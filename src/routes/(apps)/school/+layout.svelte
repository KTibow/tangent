<script>
  import StorageGate from "$lib/gates/StorageGate.svelte";

  let { children } = $props();
</script>

<StorageGate>{@render children()}</StorageGate>
