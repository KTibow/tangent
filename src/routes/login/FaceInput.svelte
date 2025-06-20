<script lang="ts">
  import iconPassword from "@ktibow/iconset-material-symbols/password-rounded";
  import { Button, Icon } from "m3-svelte";

  let { usePassword }: { usePassword: (() => void) | undefined } = $props();
</script>

TODO

{#if usePassword}
  <Button variant="outlined" iconType="left" click={usePassword}>
    <Icon icon={iconPassword} />
    Use password instead
  </Button>
{/if}
