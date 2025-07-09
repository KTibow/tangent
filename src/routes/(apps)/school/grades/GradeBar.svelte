<script lang="ts">
  import { calculateExtraCredit, type Assignment } from "./lib";

  let {
    categories,
    assignments,
  }: {
    categories: Record<string, { earned: number; possible: number; weight: number }> | undefined;
    assignments: Assignment[];
  } = $props();

  const calculateWidths = (
    assignments: Assignment[],
    categories: Record<string, { weight: number }> | undefined,
  ) => {
    let output: { name: string; percent: number; weight: number }[] = [];
    const run = (these: Assignment[], weight: number) => {
      const totalWeight = these.reduce((a, b) => a + b.possible, 0);
      for (const assignment of these) {
        output.push({
          name: assignment.name,
          percent: assignment.earned / assignment.possible,
          weight: (assignment.possible / totalWeight) * weight,
        });
      }
    };

    if (categories) {
      for (const [name, { weight }] of Object.entries(categories)) {
        run(
          assignments.filter((a) => a.category == name),
          weight,
        );
      }
    } else {
      run(assignments, 1);
    }
    return output;
  };
</script>

<div class="bar">
  {#each calculateWidths(assignments, categories) as { name, percent, weight }, i (i)}
    {@const adjustedPercent = (percent - 0.4) / 0.6}
    <div
      style:flex-basis="{weight * 100}%"
      style:background-color={adjustedPercent > 1
        ? calculateExtraCredit((adjustedPercent - 1) * 100)
        : `rgb(var(--m3-scheme-on-background) / ${adjustedPercent ** 2 * 0.98 + 0.02})`}
      title="{name} {(percent * 100).toFixed(0)}%"
    ></div>
  {/each}
</div>

<style>
  .bar {
    display: flex;
    flex: 0 0 1rem;
  }
  .bar > div {
    display: flex;
    align-items: center;
    border-radius: 2rem;
  }
</style>
