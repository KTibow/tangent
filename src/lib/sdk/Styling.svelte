<script lang="ts">
  import { defaultCSS } from "$lib/const";
  import { getStorage } from "./storage";

  const storage = getStorage();
</script>

<svelte:head>
  {@html `<style>${storage[".config/styles.css"] || defaultCSS}</style>`}
</svelte:head>
