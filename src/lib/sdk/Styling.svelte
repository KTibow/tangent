<script lang="ts">
  import { browser } from "$app/environment";
  import { defaultCSS } from "$lib";
  import { STYLE_PATH } from "$lib/sdk/storage";
  import { getStorage } from "./storage";

  let { lowest = false }: { lowest?: boolean } = $props();
  let addition = $derived(
    `:root { background-color: rgb(var(--m3-scheme-${lowest ? "surface-container-lowest" : "background"})); }`,
  );

  const storage = getStorage();
</script>

<svelte:head>
  {#if browser}
    {@html `<style>${storage[STYLE_PATH] || defaultCSS} ${addition}</style>`}
  {:else}
    {@html `<style>${defaultCSS} ${addition}</style>`}
  {/if}
</svelte:head>
