<script lang="ts">
  import { page } from "$app/state";
</script>

<h1 class="m3-font-display-large">
  {page.status} <span class="message">{page.error?.message}</span>
</h1>

<style>
  @media (prefers-color-scheme: dark) {
    :root {
      --m3-scheme-on-background: 255 255 255;
    }
  }
  h1 {
    margin: auto;
  }
  .message {
    opacity: 0.5;
  }
</style>
