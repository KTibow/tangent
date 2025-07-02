<script lang="ts">
  import PredInner from "./ExtPredInner.svelte";
  import PredSlider from "./ExtPredSlider.svelte";

  let {
    category,
    categories,
    futureAssignments,
    grade,
  }: {
    category: string;
    categories: Record<
      string,
      {
        earned: number;
        possible: number;
        weight: number;
      }
    >;
    futureAssignments: {
      points: number;
      category: string;
    }[];
    grade: number;
  } = $props();

  let points = $state(10);
  const getQuickOptions = (futureAssignments: { points: number; category: string }[]) => {
    const ideas = new Set(
      futureAssignments.filter((a) => a.category == category).map((a) => a.points),
    );

    return Array.from(ideas)
      .sort((a, b) => a - b)
      .slice(0, 4);
  };

  let { fixedPercent, variablePercent } = $derived.by(() => {
    let fixedPercent = 0;
    let variablePercent = 0;
    for (const [c, { earned, possible, weight }] of Object.entries(categories)) {
      if (c == category) {
        fixedPercent += (earned / (possible + points)) * weight;
        variablePercent += (points / (possible + points)) * weight;
      } else {
        fixedPercent += (earned / possible) * weight;
      }
    }
    return { fixedPercent, variablePercent };
  });
</script>

<PredSlider bind:points quickOptions={getQuickOptions(futureAssignments)} />
<PredInner currentPercent={grade / 100} {fixedPercent} {variablePercent} />
