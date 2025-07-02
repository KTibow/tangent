<script lang="ts">
  let { email = $bindable() }: { email: string } = $props();

  let completion = $derived(/^[12][0-9]{6}$/.test(email) ? "@apps.nsd.org" : "");
</script>

<div class="wrapper">
  <input
    class="focus-inset"
    type="email"
    placeholder="Email"
    required
    bind:value={email}
    onkeydown={(e) => {
      if (!completion) return;
      if (e.key != "ArrowRight") return;

      email += completion;
    }}
  />
  {#if completion}
    <span>
      <div class="key">→</div>
      {completion}
    </span>
  {/if}
</div>

<style>
  .wrapper {
    display: flex;
    position: relative;
    align-self: start;
  }
  span {
    position: absolute;
    top: 50%;
    right: 1rem;
    translate: 0 -50%;
    color: rgb(var(--m3-scheme-on-surface-variant));
    pointer-events: none;
  }
  .key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    border-radius: var(--m3-util-rounding-extra-small);
    border: solid 1px rgb(var(--m3-scheme-on-surface-variant));
    vertical-align: center;
  }
</style>
