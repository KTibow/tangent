<script lang="ts">
  let { css = $bindable() }: { css: string } = $props();
</script>

<svelte:window
  onmessage={({ data }) => {
    if (data.type == "css-change") {
      css = data.css;
    }
  }}
/>
<svelte:head>
  {@html `<style>${css}</style>`}
</svelte:head>
