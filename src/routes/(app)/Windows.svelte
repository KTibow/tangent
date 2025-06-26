<script lang="ts">
  import { onMount } from "svelte";
  import layoutWindows from "$lib/layout";
  import type { TangentApp } from "./apps";
  import apps from "./apps";
  import Window from "./Window.svelte";

  let { overviewing = $bindable() }: { overviewing: boolean } = $props();

  type TangentWindow = {
    app: TangentApp;
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };

  let innerWidth = $state(2560);
  let innerHeight = $state(1322);
  let windows: TangentWindow[] = $state([]);
  let windowOrder: string[] = $state([]);
  const launchApp = (app: TangentApp) => {
    const window = { id: crypto.randomUUID(), app, x: 0, y: 0, w: innerWidth, h: innerHeight };
    windows = [...windows, window];
    windowOrder = [...windowOrder, window.id];
  };
  const removeWindow = (window: TangentWindow) => {
    windows = windows.filter((w) => w.id != window.id);
    windowOrder = windowOrder.filter((id) => id != window.id);
  };

  onMount(() => {
    launchApp(apps[0]);
    launchApp(apps[0]);
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
        x: innerWidth * 0.05,
        y: innerHeight * 0.05,
        width: innerWidth * 0.9,
        height: innerHeight * 0.9,
      },
      {
        monitorHeight: innerHeight,
      },
    ),
  );
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<svelte:head>
  <title>Tangent</title>
  <meta
    name="description"
    content="If the computer is a bicycle for the mind, Tangent is a computer for school."
  />
</svelte:head>
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
