<script>
  import InputAndButton from "$lib/InputAndButton.svelte";
  import { enhanceWithTransitions } from "$lib/enhance";

  let loading = $state(false);
</script>

<form
  method="post"
  inert={loading}
  use:enhanceWithTransitions={() => {
    loading = true;
    return ({ update }) => {
      update().finally(() => (loading = false));
    };
  }}
>
  <p class="m3-font-headline-small">
    You can send feedback to Tangent. It's anonymous unless you sign off.
  </p>
  <InputAndButton placeholder="Feedback" name="feedback">
    {#snippet buttonChildren()}
      Send
    {/snippet}
  </InputAndButton>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
