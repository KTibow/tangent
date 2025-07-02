<script>
  import AuthGate from "$lib/sdk/AuthGate.svelte";

  let { children } = $props();
</script>

<AuthGate>{@render children()}</AuthGate>
