<script lang="ts">
  import { Button } from "m3-svelte";

  let { form } = $props();
</script>

<div class="center">
  {#if form?.sent}
    <p>Your request was sent</p>
  {/if}
  <Button variant="filled" href="/">Okay, go back</Button>
</div>

<style>
  .center {
    display: flex;
    flex-direction: column;
    margin: auto;
  }
</style>
