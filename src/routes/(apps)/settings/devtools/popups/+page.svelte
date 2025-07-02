<script lang="ts">
  import { Button } from "m3-svelte";
  import { send } from "$lib/sdk/comms-app";
</script>

<div class="controls">
  <Button
    variant="filled"
    onclick={() => send!({ type: "launch", name: "Authorization", popup: true })}
  >
    Authorization
  </Button>
</div>

<style>
  .controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 80ch;
  }
</style>
