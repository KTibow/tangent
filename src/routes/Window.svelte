<script lang="ts">
  import iconClose from "@ktibow/iconset-material-symbols/close-rounded";
  import { scale as scaleAnimation } from "svelte/transition";
  import Icon from "$lib/Icon.svelte";
  import { easeEmphasizedAccel, easeEmphasizedDecel } from "m3-svelte";

  let {
    x,
    y,
    w,
    h,
    scale,
    title,
    url,
    overviewing,
    index,
    close,
    select,
  }: {
    x: number;
    y: number;
    w: number;
    h: number;
    scale?: number;
    title: string;
    url: string;
    overviewing: boolean;
    index: number;
    close: () => void;
    select: () => void;
  } = $props();
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  class="app"
  class:overviewing
  style:translate="{x}px {y}px"
  style:width="{w}px"
  style:height="{h}px"
  style:--z-index={index}
  style:--scale={scale}
  onclick={overviewing ? select : undefined}
  onkeypress={(e) => overviewing && e.key == " " && select()}
  tabindex={overviewing ? 0 : -1}
  role={overviewing ? "button" : undefined}
  in:scaleAnimation={{ duration: 100, easing: easeEmphasizedDecel }}
  out:scaleAnimation={{ duration: 200, easing: easeEmphasizedAccel }}
>
  <div class="bar" inert={overviewing}>
    <p class="title m3-font-label-large">{title}</p>
    <button onclick={close}>
      <Icon icon={iconClose} width="1.125rem" height="1.125rem" />
    </button>
  </div>
  <iframe {title} src={url} inert={overviewing}></iframe>
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
  }
  .bar {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    height: 2rem;
    background-color: rgb(var(--m3-scheme-surface-container-lowest));
    user-select: none;

    > .title {
      grid-column: 2;
      align-self: center;
    }
    > button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;

      grid-column: 3;
      justify-self: end;
      transition: var(--m3-util-easing-fast);
      &:not(:hover) {
        opacity: 0.8;
      }
    }
  }
  iframe {
    flex: 1;
  }
</style>
