<script lang="ts">
  let {
    failedAssignments,
    reportedGrade,
    categories,
    grade,
    reportedCategories,
  }: {
    failedAssignments: { name: string }[] | undefined;
    reportedGrade: number | undefined;
    categories: Record<string, { earned: number; possible: number }> | undefined;
    grade: number;
    reportedCategories: Record<string, { earned: number; possible: number }> | undefined;
  } = $props();

  let gradeDelta = $derived(reportedGrade && grade - reportedGrade);
  let nonLineUpCount = $derived.by(() => {
    if (!categories || !reportedCategories) return 0;

    const notEqual = (a: number, b: number) => Math.abs(a - b) > 0.1;

    let count = 0;
    for (const name in categories) {
      const calculated = categories[name];
      const reported = reportedCategories[name];
      if (
        notEqual(
          (calculated.earned / calculated.possible) * 100,
          (reported.earned / reported.possible) * 100,
        )
      ) {
        console.warn("doesn't line up", { ours: calculated, theirs: reported });
        count++;
      }
    }
    return count;
  });

  let warnings = $derived.by(() => {
    const warningsList = [];

    if (failedAssignments && failedAssignments.length > 0) {
      const count = failedAssignments.length;
      if (count == 1) {
        warningsList.push(`failed to load ${failedAssignments[0].name}`);
      } else {
        warningsList.push(`failed to load ${count} assignments`);
      }
    }

    if (
      reportedGrade &&
      gradeDelta &&
      Math.abs(gradeDelta) > (reportedGrade % 1 == 0 ? 0.6 : 0.3)
    ) {
      if (gradeDelta > 0) {
        warningsList.push(`calculated grade is ${gradeDelta.toFixed(2)}% higher than official`);
      } else {
        warningsList.push(`calculated grade is ${(-gradeDelta).toFixed(2)}% lower than official`);
      }
    }

    if (nonLineUpCount == 1) {
      warningsList.push("a calculated category is different from official");
    } else if (nonLineUpCount > 1) {
      warningsList.push(`${nonLineUpCount} calculated categories are different from official`);
    }

    return warningsList;
  });

  const formatter = new Intl.ListFormat("en", { style: "long", type: "conjunction" });
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
</script>

{#if warnings.length > 0}
  <div class="warning">
    {capitalize(formatter.format(warnings))}
  </div>
{/if}
