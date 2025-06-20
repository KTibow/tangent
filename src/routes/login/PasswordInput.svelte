<script lang="ts">
  import iconLogin from "@ktibow/iconset-material-symbols/login-rounded";
  import iconSelfie from "@ktibow/iconset-material-symbols/photo-camera-front-rounded";
  import { Button, Icon } from "m3-svelte";
  import { autofocus } from "$lib/autofocus";
  import { enhanceWithTransitions } from "$lib/enhance";

  let { useFace }: { useFace: (() => void) | undefined } = $props();
  let loading = $state(false);
  // TODO: store password temporarily, then in the storage
</script>

<form
  method="post"
  action="?/verifyPassword"
  class="stack"
  inert={loading}
  use:enhanceWithTransitions={() => {
    loading = true;
    return ({ update }) => {
      update().finally(() => (loading = false));
    };
  }}
>
  <input
    class="focus-inset"
    type="password"
    name="password"
    placeholder="Password"
    required
    use:autofocus
  />
  <Button variant="filled" iconType="left">
    <Icon icon={iconLogin} />
    Log in
  </Button>
</form>
{#if useFace}
  <Button variant="outlined" iconType="left" click={useFace}>
    <Icon icon={iconSelfie} />
    Use face instead
  </Button>
{/if}
