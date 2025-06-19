<script lang="ts">
  import type { Snippet } from "svelte";

  let { children, contract = false }: { children: Snippet; contract?: boolean } = $props();

  let width = $state(0);
  let innerHeight = $state(0);
  let height = $derived(contract ? 0.9 * innerHeight : innerHeight);
  let r = $derived(height);
  let cx = $derived(r * -0.5);
  let cy = $derived(r * 0.4);

  let mouseX = $state(0);
  let mouseY = $state(0);
  let angleToMouse = $derived(Math.atan2(mouseY - cy, mouseX - cx));
  let nearestOnCircleX = $derived(cx + Math.cos(angleToMouse) * (r + 6));
  let nearestOnCircleY = $derived(cy + Math.sin(angleToMouse) * (r + 6));
  let tangentX1 = $derived(nearestOnCircleX + Math.cos(angleToMouse + Math.PI / 2) * 10000);
  let tangentX2 = $derived(nearestOnCircleX - Math.cos(angleToMouse + Math.PI / 2) * 10000);
  let tangentY1 = $derived(nearestOnCircleY + Math.sin(angleToMouse + Math.PI / 2) * 10000);
  let tangentY2 = $derived(nearestOnCircleY - Math.sin(angleToMouse + Math.PI / 2) * 10000);

  let margin = $derived(cx + r);
</script>

<svelte:window
  bind:innerWidth={width}
  bind:innerHeight
  onmousemove={(e) => {
    mouseX = e.pageX;
    mouseY = e.pageY;
  }}
/>

{#if margin + 600 < width}
  <svg {width} {height} fill="none">
    <circle
      {cx}
      {cy}
      {r}
      stroke="rgb(var(--m3-scheme-primary-container-subtle))"
      stroke-width="4"
    />
    <line
      x1={tangentX1}
      y1={tangentY1}
      x2={tangentX2}
      y2={tangentY2}
      stroke="rgb(var(--m3-scheme-primary))"
      stroke-width="8"
    />
  </svg>
  <div class="container fixed-width" style:width="{Math.min(width - margin, 600)}px">
    {@render children()}
  </div>
{:else}
  <div class="container">
    {@render children()}
  </div>
{/if}

<style>
  svg {
    position: absolute;
    left: 0;
    top: 0;
    z-index: -1;
  }
  .container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;

    &.fixed-width {
      align-self: end;
    }
  }
</style>
