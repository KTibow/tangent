<script lang="ts">
  import { Button } from "m3-svelte";
  import { tick } from "svelte";
  import { storage } from "$lib/sdk/_storage-app.svelte";
  import { send } from "$lib/sdk/comms-app";
  import { VERIFICATION_PATH } from "$lib/sdk/storage";

  let v = $derived(storage[VERIFICATION_PATH]);

  const verify = async () => {
    storage[VERIFICATION_PATH] = "not_real_verification";
    await tick();
    await tick();
    send!({ type: "close" });
  };
</script>

{#if v}
  <p>Verified.</p>
{:else}
  <p>For this demo, you can just hit this button to verify.</p>
  <Button onclick={verify}>Verify</Button>
{/if}
