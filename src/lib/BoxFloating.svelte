<script lang="ts">
  import type { ComponentProps } from "svelte";
  import Box from "./Box.svelte";
  import { content } from "./box-data";

  let props: ComponentProps<typeof Box> = $props();

  let bottomInset = $state(80);

  const propagate = (node: HTMLElement) => {
    $effect(() => {
      $content;
      bottomInset = node.firstElementChild!.scrollHeight + 16;
    });
  };
</script>

<svelte:head>
  {@html `<style>:root { --preferred-bottom-inset: ${bottomInset}px }</style>`}
</svelte:head>
<div use:propagate>
  <Box {...props} />
</div>

<style>
  div {
    display: contents;
    > :global(form) {
      display: flex;
      position: fixed;

      width: 25rem;
      left: 50%;
      translate: -50% 0;
      bottom: 0.5rem;

      background-color: rgb(var(--m3-scheme-surface-container-low));
      border-radius: 1.5rem;
    }
  }
</style>
