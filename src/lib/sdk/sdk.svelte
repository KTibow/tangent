<script lang="ts">
  import { defaultCSS } from "$lib/const";
  import { listenForMessages } from "./common";
  import "./_sdk.css";

  let css = $state(defaultCSS);

  if (listenForMessages) {
    listenForMessages((data) => {
      if (data.css) {
        css = data.css;
      }
    });
  }
</script>

<svelte:head>
  {@html `<style>${css}</style>`}
</svelte:head>
