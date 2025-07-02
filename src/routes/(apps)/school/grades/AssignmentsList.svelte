<script lang="ts">
  import { simplifyCategory } from "../naming";
  // import { omniContent, page } from "/lib/ui-state";
  import CategoryRepresentation from "./CategoryRepresentation.svelte";
  import SimulatorDialog from "./SimulatorDialog.svelte";
  import { roundTo, type Assignment } from "./lib";

  let {
    categories,
    assignments,
    futureAssignments,
    grade,
  }: {
    categories: Record<string, { earned: number; possible: number; weight: number }> | undefined;
    assignments: Assignment[];
    futureAssignments: { points: number; category: string }[];
    grade: number;
  } = $props();

  let dialogRef: { open: () => void } | null = null;

  let hasCategories = $derived(categories && Object.keys(categories).length > 1);
  // const openAI = () => {
  // TODO
  //     const bits = [
  //       ...assignments.map((x) => JSON.stringify(x)),
  //       ...(futureAssignments || []).map((x) => `Future: ${JSON.stringify(x)}`),
  //     ].join("\n");
  //     $omniContent = categories
  //       ? `Weighted class, with the categories:
  // ${Object.entries(categories)
  //   .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
  //   .join("\n")}
  // All assignments:
  // ${bits}`
  //       : `Unweighted class.
  // All assignments:
  // ${bits}`;
  //     $page = "ai";
  // };
</script>

<div class="list-wrapper">
  <div class="list">
    <div class="header">
      <span>
        {assignments.length}
        {assignments.length == 1 ? "assignment" : "assignments"}
      </span>
      <div style:flex-grow="1"></div>
      <!-- <button onclick={openAI}>
        <div class="layer"></div>
        Toss
      </button> -->
      <button onclick={() => dialogRef?.open()}>
        <div class="layer"></div>
        Simulate
      </button>
    </div>

    <SimulatorDialog bind:this={dialogRef} {categories} {assignments} {futureAssignments} {grade} />
    <div
      class="columns"
      class:has-categories={hasCategories}
      class:use-padding={assignments.some((a) => a.possible >= 10)}
    >
      {#each assignments as { earned, possible, name, category }, i (i)}
        {#if hasCategories}
          <CategoryRepresentation category={simplifyCategory(category)} />
        {/if}
        <p>{name}</p>
        <p class="points">
          {roundTo(earned, 3)} <span class="slash">/</span> <span class="padded">{possible}</span>
        </p>
      {/each}
    </div>
  </div>
</div>

<style>
  .list-wrapper {
    position: relative;
    flex: 0 0 25rem;
  }
  .list {
    display: flex;
    flex-direction: column;

    position: absolute;
    inset: 0;
    overflow: auto;
    background-color: rgb(var(--m3-scheme-surface-container-low));
    padding: 0.5rem;
    border-radius: 1rem;
  }
  .header {
    display: flex;
    gap: 0.5rem;
    height: 2rem;
    margin-bottom: 0.5rem;
    flex-shrink: 0;

    > span {
      align-self: center;
    }
    > button {
      display: flex;
      align-items: center;
      padding: 0 0.5rem;
      border-radius: 0.5rem;
      position: relative;

      background-color: rgb(var(--m3-scheme-secondary-container));
      color: rgb(var(--m3-scheme-on-secondary-container));
    }
  }
  .columns {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-auto-rows: 2rem;
    gap: 0.5rem;
    align-items: center;

    &.has-categories {
      grid-template-columns: 1.5rem 1fr auto;
    }
    > :global(svg) {
      color: rgb(var(--m3-scheme-tertiary));
      justify-self: center;
    }
    > p {
      white-space: nowrap;
      text-overflow: clip;
      overflow: hidden;
    }
    > .points {
      display: flex;
      justify-self: end;
    }
    .slash {
      padding: 0 0.25rem;
    }
    .padded {
      display: flex;
      justify-content: end;
      &:is(.use-padding .padded) {
        min-width: 1.5rem;
      }
    }
  }
</style>
