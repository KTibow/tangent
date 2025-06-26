<script lang="ts">
  import iconClose from "@ktibow/iconset-material-symbols/close-rounded";
  import { easeEmphasizedAccel, easeEmphasizedDecel, Layer } from "m3-svelte";
  import { scale as scaleAnimation } from "svelte/transition";
  import Icon from "$lib/Icon.svelte";
  import { connect } from "$lib/sdk/comms-tangent";
  import { getStorage } from "$lib/sdk/storage";
  import type { TangentApp } from "./apps";

  let {
    app,
    x,
    y,
    w,
    h,
    scale,
    overviewing,
    index,
    close,
    select,
  }: {
    app: TangentApp;
    x: number;
    y: number;
    w: number;
    h: number;
    scale?: number;
    overviewing: boolean;
    index: number;
    close: () => void;
    select: () => void;
  } = $props();

  const storage = getStorage();

  let iframe: HTMLIFrameElement | undefined = $state();
  let isReady = $state(false);

  let { listen, send } = $derived(connect(iframe));

  $effect(() => {
    listen((data) => {
      if (data.type == "ready") {
        isReady = true;
      }
    });
  });
  $effect(() => {
    if (isReady) {
      send({ storage: $state.snapshot(storage) });
    }
  });
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  class="app no-overview-interaction"
  class:overviewing
  style:translate="{x}px {y}px"
  style:width="{w}px"
  style:height="{h}px"
  style:--z-index={index}
  style:--scale={scale}
  onclick={overviewing ? select : undefined}
  onkeypress={(e) => overviewing && e.key == " " && select()}
  tabindex={overviewing ? 0 : -1}
  aria-label={overviewing ? app.name : undefined}
  role={overviewing ? "button" : undefined}
  in:scaleAnimation={{ duration: 100, easing: easeEmphasizedDecel }}
  out:scaleAnimation={{ duration: 200, easing: easeEmphasizedAccel }}
>
  {#if !overviewing}
    <button class="close" onclick={close}>
      <Layer />
      <Icon icon={iconClose} />
    </button>
  {/if}
  <iframe title={app.name} src={app.url} inert={overviewing} bind:this={iframe}></iframe>
</div>
<div class="info" style:left="{x + w * 0.5}px" style:top="{y + h * 0.5 + h * 0.5 * (scale || 0)}px">
  <div class="details">
    <Icon icon={app.icon} width="1.25rem" height="1.25rem" />
    <p class="title m3-font-label-large">{app.name}</p>
  </div>
  <button class="no-overview-interaction" onclick={close} aria-label="Close">
    <Layer />
    <Icon icon={iconClose} width="1.25rem" height="1.25rem" />
  </button>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;

    position: absolute;
    transform-origin: center center;
    z-index: var(--z-index);
    &.overviewing {
      cursor: pointer;
      scale: var(--scale);
      border-radius: var(--m3-util-rounding-medium);
      &:hover {
        scale: calc(var(--scale) * 1.01);
        z-index: 1000;
      }
      &:active {
        scale: calc(var(--scale) * 1.04);
        z-index: 1000;
      }
    }
    transition:
      scale var(--m3-util-easing-fast),
      translate var(--m3-util-easing-fast);
    iframe {
      flex: 1;
      background-color: rgb(var(--m3-scheme-background));
      color: rgb(var(--m3-scheme-on-background));
      border-radius: inherit;
    }
  }
  .close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: var(--m3-util-rounding-full);
    color: rgb(var(--m3-scheme-on-background) / 0.8);

    position: absolute;
    top: 0;
    right: 0;
  }
  .info {
    display: flex;
    height: 3rem;

    position: absolute;
    pointer-events: none;
    translate: -50% -50%;
    z-index: 1001;

    &:not(:is(.app.overviewing + .info)) {
      visibility: hidden;
    }
    &:not(:is(.app.overviewing:hover + .info)):not(:hover) {
      opacity: 0;
    }
    transition: opacity var(--m3-util-easing-fast);

    > * {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      border-radius: var(--m3-util-rounding-full);
      background-color: rgb(var(--m3-scheme-surface-container-highest));
    }
    > .details {
      padding-inline: 1rem;
    }
    > button {
      width: 3rem;
      position: relative;
      pointer-events: auto;
    }
  }
</style>
