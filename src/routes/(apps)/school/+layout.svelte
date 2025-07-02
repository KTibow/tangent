<script>
  import AuthWithDistrictGate from "$lib/gates/AuthWithDistrictGate.svelte";

  let { children } = $props();
</script>

<AuthWithDistrictGate {children} />
