<script lang="ts">
  import "../app.css";
  let { children } = $props();
</script>

<svelte:head>
  <title>Tangent</title>
</svelte:head>
{@render children()}
