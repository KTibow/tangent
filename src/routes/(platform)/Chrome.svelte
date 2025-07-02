<script lang="ts">
  import { Layer } from "m3-svelte";
  import { preloadData } from "$app/navigation";
  import Icon from "$lib/Icon.svelte";
  import HotCorner from "./HotCorner.svelte";
  import apps, { type TangentApp, type TangentWindow } from "./apps";

  let {
    overviewing = $bindable(),
    backgroundScale,
    windows = $bindable(),
    windowOrder = $bindable(),
    launch,
  }: {
    overviewing: boolean;
    backgroundScale: number;
    windows: TangentWindow[];
    windowOrder: string[];
    launch: (app: TangentApp, popup: boolean) => void;
  } = $props();

  $effect(() => {
    if (!windowOrder.length) {
      // weird code but basically just forces overviewing on
      overviewing = overviewing || true;
    }
  });

  const openApp = (app: TangentApp) => {
    if (windows.some((w) => w.app.url == app.url)) {
      // Move all to front
      const windowIds = windows.filter((w) => w.app.url == app.url).map((w) => w.id);
      windowOrder = windowOrder.filter((id) => !windowIds.includes(id));
      windowOrder.push(...windowIds);
      return;
    }
    launch(app, false);
  };
</script>

{#if windowOrder.length}
  <HotCorner bind:overviewing />
{/if}
<div class="background" class:overviewing style:--background-scale={backgroundScale}></div>
<div class="dock" inert={!overviewing}>
  <!-- todo: customization -->
  {#each apps.filter((a) => !a.internal) as app (app.name)}
    <button
      class="no-overview-interaction"
      onpointerover={() => {
        preloadData(app.url);
      }}
      onclick={(e) => {
        if (e.ctrlKey) {
          launch(app, false);
        } else {
          openApp(app);
          overviewing = false;
        }
      }}
    >
      <Layer />
      <Icon icon={app.icon} width="1.5rem" height="1.5rem" />
      <p class="tooltip m3-font-label-small">{app.name}</p>
      {#if windows.some((w) => w.app.url == app.url)}
        <div class="indicator"></div>
      {/if}
    </button>
  {/each}
</div>

<style>
  .background {
    position: absolute;
    inset: 0;
    background-color: rgb(var(--m3-scheme-primary-container-subtle) / 0.6);
    transition: var(--m3-util-easing-fast);
    &.overviewing {
      border-radius: 4rem;
      scale: var(--background-scale);
      transition: var(--m3-util-easing-fast-spatial);
    }
  }

  .dock {
    display: flex;
    height: 5rem;
    background-color: rgb(var(--m3-scheme-surface-container-highest));
    border-radius: 1rem;

    position: absolute;
    left: 50%;
    bottom: 3rem;
    translate: -50% 50%;
  }
  button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1 / 1;
    border-radius: inherit;

    position: relative;
  }
  button > :global(svg) {
    color: rgb(var(--m3-scheme-primary));
  }
  p {
    color: rgb(var(--m3-scheme-on-surface-variant));
    overflow: hidden;
    transition: var(--m3-util-easing-fast) 500ms;
    &:not(button:hover p) {
      height: 0;
      opacity: 0;
      transition: var(--m3-util-easing-fast);
    }
  }
  .indicator {
    position: absolute;
    bottom: 0.5rem;
    left: 50%;
    translate: -50% 0;
    width: 0.25rem;
    height: 0.25rem;
    border-radius: var(--m3-util-rounding-full);
    background-color: rgb(var(--m3-scheme-secondary));
  }
</style>
