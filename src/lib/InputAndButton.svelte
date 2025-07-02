<script lang="ts">
  import { Button } from "m3-svelte";
  import type { Snippet } from "svelte";

  let {
    placeholder,
    name,
    buttonChildren,
  }: { placeholder: string; name?: string; buttonChildren: Snippet } = $props();
</script>

<div>
  <input class="focus-inset" {placeholder} {name} required />
  <Button variant="filled">{@render buttonChildren()}</Button>
</div>

<style>
  div {
    display: flex;
    flex-direction: column;
    max-width: 80ch;
    position: relative;

    > input {
      padding-inline: 1rem;
      padding-top: 0.5rem;
      padding-bottom: 3rem;
      border-radius: 1.25rem;
      background-color: rgb(var(--m3-scheme-surface-container-low));
    }
    > :global(button) {
      position: absolute !important;
      right: 0;
      bottom: 0;
    }
  }
</style>
