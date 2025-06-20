<script lang="ts">
  import { enhanceWithTransitions } from "$lib/enhance";

  let form: HTMLFormElement | undefined = $state();
  let value = $state("");
  let loading = $state(false);

  let tabbable = $derived(/^[12][0-9]{6}$/.test(value));
  $effect(() => {
    const completed = value.includes("@") && (value.endsWith(".org") || value.endsWith(".net"));
    if (completed) {
      form?.requestSubmit();
    }
  });
</script>

<form
  method="post"
  action="?/email"
  inert={loading}
  use:enhanceWithTransitions={() => {
    loading = true;
    return ({ update }) => {
      update().finally(() => (loading = false));
    };
  }}
  bind:this={form}
>
  <div>
    <!-- svelte-ignore a11y_autofocus -->
    <input
      class="focus-inset"
      type="email"
      name="email"
      placeholder="Email"
      required
      bind:value
      autofocus
      onkeydown={(e) => {
        if (e.key == "Tab" && tabbable) {
          e.preventDefault();
          value += "@apps.nsd.org";
        }
      }}
    />
    {#if tabbable}
      <span class="hint m3-font-label-large">Tab: @apps.nsd.org</span>
    {/if}
  </div>
</form>

<style>
  div {
    display: flex;
    position: relative;
    width: 20rem;
  }
  input {
    height: 3rem;
    border-radius: var(--m3-util-rounding-full);
    padding: 0 1rem;
    background-color: rgb(var(--m3-scheme-surface-container-low));
    min-width: 0;
    flex: 1;
  }
  .hint {
    position: absolute;
    right: 1rem;
    top: 50%;
    translate: 0 -50%;
    color: rgb(var(--m3-scheme-on-surface-variant));
    pointer-events: none;
  }
</style>
