<script lang="ts">
  import { type Assignment } from "./lib";

  let {
    grade,
    categories,
    assignments,
  }: {
    grade: number;
    categories: Record<string, { weight: number }> | undefined;
    assignments: Assignment[];
  } = $props();

  let entries = $derived.by(() => {
    const run = (these: Assignment[], weight: number): { name: string; size: number }[] => {
      const totalWeight = these.reduce((a, b) => a + b.possible, 0);
      let stats = { earned: 0, possible: 0 };
      const result: { name: string; size: number }[] = [];

      for (const assignment of these) {
        if (assignment.missing) {
          result.push({
            name: assignment.name,
            size: (assignment.possible / totalWeight) * weight,
          });
        }

        stats.earned += assignment.earned;
        stats.possible += assignment.possible;
      }

      return result;
    };

    let allEntries: { name: string; size: number }[] = [];

    if (categories) {
      for (const [name, { weight }] of Object.entries(categories)) {
        allEntries = [
          ...allEntries,
          ...run(
            assignments.filter((a) => a.category == name),
            weight,
          ),
        ];
      }
    } else {
      allEntries = run(assignments, 1);
    }

    return allEntries;
  });
</script>

{#if entries.length > 1}
  {@const entriesTotal = entries.reduce((a, b) => a + b.size, 0)}
  <div class="group">
    <h3>
      Turn in missing assignments for a
      {#if entriesTotal * 0.6 * 100 + grade == 100}
        <span style:color="rgb(var(--m3-scheme-tertiary))">100%</span>
      {:else}
        <span style:color="rgb(var(--m3-scheme-tertiary))"
          >{(entriesTotal * 0.6 * 100).toFixed(2)}%</span
        >
        boost
      {/if}
    </h3>
    <div class="bar">
      <div
        style:width="{grade + entriesTotal * 0.6 * 100}%"
        style:background-color="rgb(var(--m3-scheme-tertiary))"
      ></div>
      <div
        style:width="{grade}%"
        style:background-color="rgb(var(--m3-scheme-surface-container-high))"
      ></div>
    </div>
    <div style:flex-grow="1"></div>
    <div class="table">
      <p>At missing</p>
      <p>{grade.toFixed(1)}%</p>
      <p>At 60%</p>
      <p>{(grade + entriesTotal * 0.4 * 100).toFixed(1)}%</p>
      <p>At 100%</p>
      <p>{(grade + entriesTotal * 0.6 * 100).toFixed(2).replace(/0$/, "")}%</p>
    </div>
  </div>
  <div class="group">
    <h3>{entries.length} missing assignments</h3>
    <div style:flex-grow="1"></div>
    <div class="table">
      {#each entries as { name, size }, i (i)}
        <p>{name}</p>
        <p>+{(size * 0.6 * 100).toFixed(2)}%</p>
      {/each}
    </div>
  </div>
{:else if entries.length}
  {@const { name, size } = entries[0]}
  <div class="group">
    <h3>The missing assignment {name}</h3>
    <div class="bar">
      <div
        style:width="{grade + size * 0.6 * 100}%"
        style:background-color="rgb(var(--m3-scheme-tertiary))"
      ></div>
      <div
        style:width="{grade}%"
        style:background-color="rgb(var(--m3-scheme-surface-container-high))"
      ></div>
    </div>
    <div class="table">
      <p>At missing</p>
      <p>{grade.toFixed(1)}%</p>
      <p>At 60%</p>
      <p>{(grade + size * 0.2 * 100).toFixed(1)}%</p>
      <p>At 100%</p>
      <p style:color="rgb(var(--m3-scheme-tertiary))">
        {(grade + size * 0.6 * 100).toFixed(2).replace(/0$/, "")}%
      </p>
    </div>
  </div>
{/if}

<style>
  h3 {
    font-size: 1rem;
    opacity: 0.8;
  }
  .group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    @media (width >= 40rem) {
      min-width: 25rem;
    }
  }

  .table {
    display: grid;
    grid-template-columns: auto auto;

    gap: 0.5rem;
    flex-shrink: 0;

    > p {
      white-space: nowrap;
      text-overflow: clip;
      overflow: hidden;
      &:nth-child(even) {
        opacity: 0.8;
      }
      &:nth-child(even) {
        justify-self: end;
      }
    }
  }
  .bar {
    display: flex;
    background-color: rgb(var(--m3-scheme-surface-container-low));
    height: 2rem;
    border-radius: 1rem;
    position: relative;
    > div {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      border-radius: 1rem;
    }
  }
</style>
