<script lang="ts">
  import { roundTo } from "./lib";

  let { progress }: { progress: number } = $props();
</script>

<div>
  <svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24">
    <circle
      cx="12"
      cy="12"
      r="9"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      opacity="0.2"
    />
    <circle
      cx="12"
      cy="12"
      r="9"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-dasharray="56.54 56.54"
      stroke-dashoffset={-56.54 * (1 + progress)}
    />
  </svg>
  {roundTo(progress * 100, 0)}% done
</div>

<style>
  div {
    display: flex;
    gap: 0.5rem;
  }
</style>
