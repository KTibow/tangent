<script lang="ts">
  import iconClose from "@ktibow/iconset-material-symbols/close-rounded";
  import Icon from "$lib/Icon.svelte";
  import { shortenCategory } from "../naming";
  import ExtPredCategory from "./ExtPredCategory.svelte";
  import ExtPredOverall from "./ExtPredOverall.svelte";
  import type { Assignment } from "./lib";

  let {
    categories,
    assignments,
    futureAssignments,
    grade,
    close,
  }: {
    categories: Record<string, { earned: number; possible: number; weight: number }> | undefined;
    assignments: Assignment[];
    futureAssignments: { points: number; category: string }[];
    grade: number;
    close: () => void;
  } = $props();

  let simulating = $state(0);

  $effect(() => {
    if (categories) {
      if (simulating >= Object.keys(categories).length)
        simulating = Object.keys(categories).length - 1;
    } else {
      if (simulating > 0) simulating = 0;
    }
  });
</script>

<h2>
  {#if categories}
    <select bind:value={simulating}>
      {#each Object.keys(categories) as name, i (i)}
        <option value={i}>{shortenCategory(name).toUpperCase()}</option>
      {/each}
    </select>
  {:else}
    <div style:width="1.5rem"></div>
  {/if}
  <span>SIMULATOR</span>
  <div style:flex-grow="1"></div>
  <button onclick={close}>
    <Icon icon={iconClose} />
  </button>
</h2>
{#if categories}
  {@const categoryName = Object.keys(categories)[simulating]}
  <ExtPredCategory category={categoryName} {categories} {futureAssignments} {grade} />
{:else}
  <ExtPredOverall {assignments} {futureAssignments} {grade} />
{/if}

<style>
  h2 {
    display: flex;
    height: 4.5rem;
    margin: -1.5rem;
    font-size: 1rem;
    color: rgb(var(--m3-scheme-on-surface-variant));

    > select {
      padding-left: 1.5rem;
    }
    > span {
      align-self: center;
    }
    > button {
      display: flex;
      align-items: center;
      padding: 0 1.5rem;
    }
  }
</style>
