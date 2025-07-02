<script lang="ts">
  import { browser } from "$app/environment";
  import { defaultCSS } from "$lib";
  import { STYLE_PATH } from "$lib/sdk/storage";
  import { getStorage } from "./storage";

  const storage = getStorage();
</script>

<svelte:head>
  {#if browser}
    {@html `<style>${storage[STYLE_PATH] || defaultCSS}</style>`}
  {:else}
    {@html `<style>${defaultCSS}</style>`}
  {/if}
</svelte:head>
