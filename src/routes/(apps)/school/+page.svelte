<script lang="ts">
  import iconPrev from "@ktibow/iconset-material-symbols/arrow-back-rounded";
  import iconNext from "@ktibow/iconset-material-symbols/arrow-forward-rounded";
  import iconDown from "@ktibow/iconset-material-symbols/keyboard-arrow-down-rounded";
  import iconUp from "@ktibow/iconset-material-symbols/keyboard-arrow-up-rounded";
  import { easeEmphasized, Layer } from "m3-svelte";
  import { slide } from "svelte/transition";
  import { ordinal, whileMounted } from "$lib";
  import Icon from "$lib/Icon.svelte";
  import studentvue, { convertAuth } from "$lib/api/studentvue";
  import { trackCached } from "$lib/data-tracking";
  import { AUTH_PATH, getStorage } from "$lib/sdk/storage";
  import { now } from "$lib/utils-now.svelte";
  import Root from "./grades/Root.svelte";
  import { recalculateGrade, roundTo } from "./grades/lib";
  import { studentvueToGrades } from "./grades/loading";
  import { simplifyClassName } from "./naming";
  import { studentvueToSchedule } from "./schedule/loading";
  import type { Class } from "./types";

  const storage = getStorage();
  let auth = $derived(storage[AUTH_PATH]);

  const grades = trackCached({
    id: "grades",
    loader: async () => {
      const authData = convertAuth(auth);
      if (!authData) return;

      const gradebook = await studentvue(...authData, "Gradebook");
      return studentvueToGrades(gradebook);
    },
  });
  const schedule = trackCached({
    id: "schedule",
    loader: async () => {
      const authData = convertAuth(auth);
      if (!authData) return;

      const schedule = await studentvue(...authData, "StudentClassList");
      return studentvueToSchedule(schedule);
    },
  });
  whileMounted($grades.run);
  whileMounted($schedule.run);

  let classes = $derived.by(() => {
    const structure: Record<number, Class> = {};
    if ($schedule.data) {
      for (const clazz of $schedule.data) {
        structure[clazz.period] ||= {
          period: clazz.period,
          name: simplifyClassName(clazz.name),
        };
        if (clazz.startTime) {
          structure[clazz.period].startTime = clazz.startTime;
        }
        if (clazz.endTime) {
          structure[clazz.period].endTime = clazz.endTime;
        }
      }
    }
    if ($grades.data) {
      for (const grade of $grades.data) {
        structure[grade.period] ||= {
          period: grade.period,
          name: simplifyClassName(grade.title),
        };
        structure[grade.period].grade = grade;
      }
    }
    return Object.values(structure).sort((a, b) => a.period - b.period);
  });
  let clazz = $derived(classes.find((c) => c.period == period));
  let grade = $derived(clazz?.grade);
  let actualCurrentPeriod = $derived.by(() => {
    if (!classes) return undefined;
    const time = now.getTime();

    for (const clazz of classes) {
      if (!clazz.startTime || !clazz.endTime) continue;
      const startTime = new Date(clazz.startTime).getTime();
      const endTime = new Date(clazz.endTime).getTime();

      if (time >= startTime && time < endTime) {
        return clazz.period;
      }
    }
    return undefined;
  });

  let period = $state(1);
  let gradesOpen = $state(false);
</script>

<!-- TODO: dashboard -->
<div class="controls">
  {#if clazz}
    {@const prevClass = classes.findLast((c) => c.period < clazz.period)}
    {@const nextClass = classes.find((c) => c.period > clazz.period)}
    <div>
      {clazz.name}
      {#if clazz.period == actualCurrentPeriod && clazz.endTime}
        <span style:color="rgb(var(--m3-scheme-tertiary))">
          {Math.ceil((new Date(clazz.endTime).getTime() - now.getTime()) / 60000)}
        </span>
      {:else}
        <span style:color="rgb(var(--m3-scheme-on-surface-variant))">
          {ordinal(period)}
        </span>
      {/if}
    </div>
    <button
      class:fade={prevClass}
      disabled={!prevClass}
      onclick={() => (period = prevClass!.period)}
    >
      <Layer />
      <Icon icon={iconPrev} />
    </button>
    <button
      class:fade={nextClass}
      disabled={!nextClass}
      onclick={() => (period = nextClass!.period)}
    >
      <Layer />
      <Icon icon={iconNext} />
    </button>
  {/if}
  <button class="fade tnum" onclick={() => (gradesOpen = !gradesOpen)}>
    <Layer />
    {#if gradesOpen}
      Grade
      <Icon icon={iconDown} />
    {:else if grade}
      {roundTo(recalculateGrade(grade), 1)}%
      <Icon icon={iconUp} />
    {/if}
  </button>
</div>
{#if gradesOpen && grade}
  <div class="grade-details tnum" transition:slide={{ duration: 500, easing: easeEmphasized }}>
    <Root {...grade} />
  </div>
{/if}

<style>
  :global(.fade) {
    background-image: linear-gradient(
      to bottom,
      rgb(var(--m3-scheme-primary-container-subtle) / 1) 0,
      rgb(var(--m3-scheme-primary-container-subtle) / 0.8) calc(var(--gradient-height) * 0.25),
      rgb(var(--m3-scheme-primary-container-subtle) / 0.4) calc(var(--gradient-height) * 0.5),
      rgb(var(--m3-scheme-primary-container-subtle) / 0.2) calc(var(--gradient-height) * 0.75),
      transparent var(--gradient-height)
    );
    color: rgb(var(--m3-scheme-on-primary-container-subtle));
  }

  .controls {
    display: flex;
    height: 3rem;
    gap: 0.25rem;
    margin-top: auto;

    > * {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0 1rem;

      transition:
        background-image var(--m3-util-easing-slow),
        color var(--m3-util-easing-slow);
      border-radius: var(--m3-util-rounding-medium);
      pointer-events: auto;
      position: relative;
    }
    > :first-child {
      border-start-start-radius: 1.5rem;
    }
    > :last-child {
      border-start-end-radius: 1.5rem;
    }
    > div {
      flex: 1;
    }
    > button {
      --gradient-height: 3rem;
      &:disabled {
        color: rgb(var(--m3-scheme-on-surface) / 0.38);
      }
      &:not(:has(:global(svg))) {
        display: none;
      }
    }
    > :not(button:enabled) {
      outline: solid 2px rgb(var(--m3-scheme-outline-variant));
      outline-offset: -2px;
    }
  }
  .grade-details {
    display: flex;
    @media (width < 40rem) {
      flex-direction: column;
    }
    overflow: auto;
    gap: 1.5rem;
    padding: 1.5rem 0.5rem 0.5rem 0.5rem;
    min-height: clamp(0rem, calc(8dvh + 8rem), 15rem);
  }
</style>
