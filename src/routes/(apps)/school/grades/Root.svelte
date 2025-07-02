<script lang="ts">
  // import { semester } from "/lib/district-data";
  import AssignmentsList from "./AssignmentsList.svelte";
  import Grade from "./Grade.svelte";
  import GradeBar from "./GradeBar.svelte";
  import GradeDetails from "./GradeDetails.svelte";
  import Missing from "./Missing.svelte";
  import Tips from "./Tips.svelte";
  import { getPoints, recalculateGrade, type FullPeriod } from "./lib";

  let {
    categories,
    assignments,
    failedAssignments,
    futureAssignments,
    reportedCategories,
    reportedGrade,
  }: FullPeriod = $props();

  let grade = $derived(recalculateGrade({ categories, assignments }));
  // const now = new Date();
  const done = 100;
  const total = 100;
  // TODO: semester
  // const done = semester.filter((d) => d.getTime() < now.getTime()).length;
  // const total = semester.length;
  const timeBasedProgress = done / total;
  let pointBasedProgress = $derived.by(() => {
    if (!categories) {
      const possible = getPoints(assignments).possible;
      const futurePossible = futureAssignments.reduce((a, b) => a + b.points, 0);
      return possible / (possible + futurePossible);
    }
    let cumulativeProgress = 0;
    for (const [category, { possible, weight }] of Object.entries(categories)) {
      const futurePossible = futureAssignments
        .filter((a) => a.category == category)
        .reduce((a, b) => a + b.points, 0);
      cumulativeProgress += (possible / (possible + futurePossible)) * weight;
    }
    return cumulativeProgress;
  });
  let progress = $derived(
    pointBasedProgress ? Math.min(timeBasedProgress, pointBasedProgress) : timeBasedProgress,
  );
</script>

<div class="column">
  <Grade {grade} />
  <Tips {categories} {failedAssignments} {reportedGrade} {grade} {reportedCategories} {progress} />
</div>
{#if assignments.length > 1}
  <div class="column" class:no-categories={!categories} style:flex-grow="1">
    <GradeBar {categories} {assignments} />
    <GradeDetails {categories} {assignments} />
  </div>
{:else}
  <div style:flex-grow="1"></div>
{/if}
{#if assignments.some((a) => a.missing)}
  <Missing {grade} {categories} {assignments} />
{/if}
<AssignmentsList {categories} {assignments} {futureAssignments} {grade} />

<style>
  .column {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    &.no-categories {
      display: grid;
      grid-template-rows: 1fr auto;
    }
    @media (width >= 40rem) {
      min-width: 25rem;
      flex-shrink: 0;
    }
  }
</style>
