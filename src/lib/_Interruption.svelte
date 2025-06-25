<script lang="ts">
  import type { IconifyIcon } from "@iconify/types";
  import { Icon } from "m3-svelte";
  import type { Snippet } from "svelte";

  let {
    icon,
    headline,
    children,
    buttons,
    center = true,
  }: {
    icon: IconifyIcon;
    headline: string;
    children: Snippet;
    buttons?: Snippet;
    center?: boolean;
  } = $props();
</script>

<div class="interruption" class:center>
  <Icon {icon} width="1.5rem" height="1.5rem" />
  <h1 class="m3-font-headline-large">{headline}</h1>
  {@render children()}
  <div class="buttons">
    {@render buttons?.()}
  </div>
</div>

<style>
  .interruption {
    display: flex;
    flex-direction: column;
    max-width: 30rem;
    padding: 1.5rem;
    border-radius: 1.75rem;
    background-color: rgb(var(--m3-scheme-surface-container-low));
    color: rgb(var(--m3-scheme-on-surface-variant));
    z-index: 1;

    &.center {
      margin: auto;
    }

    > :global(svg) {
      color: rgb(var(--m3-scheme-secondary));
    }
    > h1 {
      color: rgb(var(--m3-scheme-on-background));
      margin-block: 1rem;
    }
    > .buttons {
      display: flex;
      justify-content: end;
      gap: 0.5rem;
      margin-top: 1.5rem;
      &:empty {
        display: none;
      }
    }
  }
</style>
