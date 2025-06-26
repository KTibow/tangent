<script lang="ts">
  import { defaultCSS } from "$lib/const";
  import Styling from "./Styling.svelte";
  import HotCorner from "./HotCorner.svelte";
  import Windows from "./Windows.svelte";

  let overviewing = $state(true);
  let css = $state(defaultCSS);
</script>

<svelte:window
  onclick={overviewing
    ? (e) => {
        const target = e.target as HTMLElement;
        const closest = target.closest("button") || target.closest(".app");
        if (!closest) {
          // They clicked away
          overviewing = false;
        }
      }
    : undefined}
/>
<Styling bind:css />
<HotCorner bind:overviewing />
<div class="window-surface" class:overviewing></div>
<Windows bind:overviewing bind:css />

<style>
  :root {
    background-color: rgb(var(--m3-scheme-surface-container-lowest));
  }
  .window-surface {
    position: absolute;
    inset: 0;
    background-color: rgb(var(--m3-scheme-primary-container-subtle) / 0.6);
    transition: var(--m3-util-easing-fast);
    &.overviewing {
      border-radius: 4rem;
      scale: 0.89;
      transition: var(--m3-util-easing-fast-spatial);
    }
  }
</style>
