<script lang="ts">
  import iconLeft from "@ktibow/iconset-material-symbols/arrow-back-rounded";
  import iconRight from "@ktibow/iconset-material-symbols/arrow-forward-rounded";
  import Icon from "$lib/Icon.svelte";

  let {
    currentPercent,
    fixedPercent,
    variablePercent,
  }: {
    currentPercent: number;
    fixedPercent: number;
    variablePercent: number;
  } = $props();

  let maxLoss = $derived(fixedPercent + 0.4 * variablePercent);
  let maxGain = $derived(fixedPercent + variablePercent);
  let solvedLoss = $derived((currentPercent - 0.01 - fixedPercent) / variablePercent);
  let solvedGain = $derived((currentPercent + 0.01 - fixedPercent) / variablePercent);

  let inputScore: number | undefined = $state();
  let outputScore = $derived(
    inputScore && 100 * (fixedPercent + variablePercent * 0.01 * inputScore),
  );
</script>

<div class="cols">
  <div class="down">
    <h2>
      <Icon icon={iconLeft} />
      Max down
    </h2>
    {#if currentPercent - maxLoss < 0.01 * 0.01}
      <p>None</p>
    {:else if currentPercent - maxLoss < 0.001}
      <p>Miniscule</p>
    {:else if currentPercent - maxLoss < 0.01}
      <p>Small (-{(100 * (currentPercent - maxLoss)).toFixed(1)}%)</p>
    {:else}
      <p>-{(100 * (currentPercent - maxLoss)).toFixed(1)}%</p>
      <p>
        <strong>Score &gt;{(solvedLoss * 100).toFixed(solvedLoss < 0.8 ? 0 : 1)}%</strong> to avoid losing
        1%
      </p>
    {/if}
  </div>
  <div class="up">
    <h2>
      Max up
      <Icon icon={iconRight} />
    </h2>
    {#if maxGain - currentPercent < 0.01 * 0.01}
      <p>None</p>
    {:else if maxGain - currentPercent < 0.001}
      <p>Miniscule</p>
    {:else if maxGain - currentPercent < 0.01}
      <p>Small (+{(100 * (maxGain - currentPercent)).toFixed(1)}%)</p>
    {:else}
      <p>+{(100 * (maxGain - currentPercent)).toFixed(1)}%</p>
      <p><strong>Score &gt;{(solvedGain * 100).toFixed(1)}%</strong> to gain 1%</p>
    {/if}
  </div>
</div>
<div class="bar">
  <div
    style:left="0"
    style:width="100%"
    style:border-radius="0.5rem"
    style:background-color="rgb(var(--m3-scheme-surface-container-lowest))"
  ></div>
  <div
    style:left="{(fixedPercent + variablePercent * 0.4) * 100}%"
    style:width="{(currentPercent - (fixedPercent + variablePercent * 0.4)) * 100}%"
    style:border-radius="1rem 0 0 1rem"
    style:background-color="rgb(var(--m3-scheme-tertiary-container-subtle))"
    title="Max down is {((fixedPercent + variablePercent * 0.4) * 100).toFixed(2)}%"
  ></div>
  <div
    style:left="{currentPercent * 100}%"
    style:width="{(fixedPercent + variablePercent - currentPercent) * 100}%"
    style:border-radius="0 1rem 1rem 0"
    style:background-color="rgb(var(--m3-scheme-primary-container-subtle))"
    title="Max up is {((fixedPercent + variablePercent) * 100).toFixed(2)}%"
  ></div>
</div>
<p class="note">
  {(fixedPercent * 100).toFixed(2)} +
  <input type="number" min="40" max="100" bind:value={inputScore} placeholder="score" />% * {(
    variablePercent * 100
  ).toFixed(2)} =
  {#if outputScore}
    {outputScore.toFixed(2)}
  {:else}
    grade
  {/if}
</p>

<style>
  .cols {
    display: grid;
    gap: 0.5rem;
    margin-top: 0.5rem;

    @media (width >= 40rem) {
      grid-template-columns: 1fr 1fr;
    }
  }
  .cols > div {
    display: flex;
    flex-direction: column;

    padding: 1rem;
    border-radius: 1.5rem;
  }
  .cols h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 400;
    font-size: 1.25rem;
  }

  .down {
    background-color: rgb(var(--m3-scheme-tertiary-container-subtle));
    color: rgb(var(--m3-scheme-on-tertiary-container-subtle));
  }
  .up {
    background-color: rgb(var(--m3-scheme-primary-container-subtle));
    color: rgb(var(--m3-scheme-on-primary-container-subtle));
    text-align: right;
  }
  .up h2 {
    justify-content: flex-end;
  }

  .bar {
    display: flex;

    height: 4rem;
    position: relative;

    margin-top: 0.5rem;
  }
  .bar > div {
    position: absolute;
    top: 0;
    bottom: 0;
  }

  .note {
    opacity: 0.8;
    margin-top: auto;
  }
</style>
