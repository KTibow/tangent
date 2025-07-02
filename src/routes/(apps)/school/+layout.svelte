<script>
  import AuthWithConnectGate from "$lib/gates/AuthWithConnectGate.svelte";

  let { children } = $props();
</script>

<AuthWithConnectGate {children} />
