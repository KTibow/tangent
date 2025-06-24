<script lang="ts">
  import layoutWindows from "$lib/layout";
  import { onMount } from "svelte";
  import HotCorner from "./HotCorner.svelte";
  import Window from "./Window.svelte";

  type Window = {
    id: string;
    title: string;
    url: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };

  let innerWidth = $state(2560);
  let innerHeight = $state(1322);
  let overviewing = $state(true);
  let windows: Window[] = $state([]);
  let windowOrder: string[] = $state([]);
  const addWindow = (window: Window) => {
    windows = [...windows, window];
    windowOrder = [...windowOrder, window.id];
  };
  const removeWindow = (window: Window) => {
    windows = windows.filter((w) => w.id != window.id);
    windowOrder = windowOrder.filter((id) => id != window.id);
  };

  onMount(() => {
    addWindow({
      id: crypto.randomUUID(),
      title: "Title 1",
      url: "https://example.com",
      x: 0,
      y: 0,
      w: innerWidth,
      h: innerHeight,
    });
    addWindow({
      id: crypto.randomUUID(),
      title: "Title 2",
      url: "https://example.com",
      x: 0,
      y: 0,
      w: innerWidth,
      h: innerHeight,
    });
  });

  let overviewed = $derived(
    layoutWindows(
      windows.map((w) => ({
        width: w.w,
        height: w.h,
        centerX: w.x + w.w * 0.5,
        centerY: w.y + w.h * 0.5,
        id: w.id,
      })),
      {
        x: innerWidth * 0.05 - 8,
        y: innerHeight * 0.05,
        width: innerWidth * 0.9 + 16,
        height: innerHeight * 0.9,
      },
      {
        monitorHeight: innerHeight,
      },
    ),
  );
</script>

<svelte:window
  bind:innerWidth
  bind:innerHeight
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
<div class="window-surface" class:overviewing></div>
<HotCorner bind:overviewing />
{#each windows as window (window.id)}
  <Window
    {...window}
    {overviewing}
    index={windowOrder.indexOf(window.id)}
    close={() => removeWindow(window)}
    select={() => {
      windowOrder = [...windowOrder.filter((i) => i != window.id), window.id];
      overviewing = false;
    }}
    {...overviewing ? overviewed[window.id] : {}}
  />
{/each}

<style>
  .window-surface {
    position: absolute;
    inset: 0;
    background-color: rgb(var(--m3-scheme-primary-container-subtle));
    transition: var(--m3-util-easing-fast);
    &.overviewing {
      border-radius: 4rem;
      scale: 0.9;
      transition: var(--m3-util-easing-fast-spatial);
    }
  }
</style>
