<script>
  let { children } = $props();
</script>

<div>
  {@render children()}
</div>

<style>
  :root {
    --preferred-top-inset: 1.5rem;
  }
  div {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    padding-top: var(--top-inset);
  }
</style>
