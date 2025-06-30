<script lang="ts">
  import { defaultCSS } from "$lib";
  import { getStorage } from "./storage";

  const storage = getStorage();
</script>

<svelte:head>
  {@html `<style>${storage[".config/tangent-styles.css"] || defaultCSS}</style>`}
</svelte:head>
