<script lang="ts">
  import layoutWindows from "$lib/layout";
  import Chrome from "./Chrome.svelte";
  import Window from "./Window.svelte";
  import type { TangentWindow } from "./apps";

  let {
    overviewing = $bindable(),
  }: {
    overviewing: boolean;
  } = $props();

  let innerWidth = $state(2560);
  let innerHeight = $state(1322);
  let windows: TangentWindow[] = $state([]);
  let windowOrder: string[] = $state([]);
  const removeWindow = (window: TangentWindow) => {
    windows = windows.filter((w) => w.id != window.id);
    windowOrder = windowOrder.filter((id) => id != window.id);
  };

  let backgroundScale = $derived(Math.max((innerHeight - 6 * 16 * 2) / innerHeight, 0.01));
  let backgroundMarginScale = $derived((1 - backgroundScale) / 2);
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
        x: innerWidth * backgroundMarginScale,
        y: innerHeight * backgroundMarginScale,
        width: innerWidth * backgroundScale,
        height: innerHeight * backgroundScale,
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

<Chrome bind:overviewing {backgroundScale} bind:windows bind:windowOrder />
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
