<script lang="ts">
  let {
    points = $bindable(),
    quickOptions,
  }: {
    points: number;
    quickOptions: number[];
  } = $props();
</script>

<div>
  <span>{points} pointer</span>
  {#each quickOptions as option (option)}
    <button onclick={() => (points = option)}>{option}</button>
  {/each}
  <input type="range" min={1} bind:value={points} />
</div>

<style>
  div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
  }
  div button {
    padding: 0 0.5rem;
    border-radius: 1rem;
    background-color: rgb(var(--m3-scheme-secondary-container));
    color: rgb(var(--m3-scheme-on-secondary-container));
  }
  div input {
    flex-grow: 1;
    align-self: stretch;
  }
</style>
