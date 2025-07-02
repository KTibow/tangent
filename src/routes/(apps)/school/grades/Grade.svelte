<script lang="ts">
  import { roundTo } from "./lib";

  let {
    grade,
  }: {
    grade: number;
  } = $props();
</script>

<div class="root" style:--percent="{grade}%">
  <div class="normal">
    {roundTo(grade, grade > 100 ? 1 : 2)}
    <div class="percent">%</div>
  </div>
  <div class="shadowed">
    {roundTo(grade, grade > 100 ? 1 : 2)}
    <div class="percent">%</div>
  </div>
</div>

<style>
  .root {
    display: grid;
    position: relative;
    line-height: 1;
    flex-grow: 1;
  }

  .normal,
  .shadowed {
    display: flex;
    align-items: center;
    font-size: 6rem;
    grid-row: 1;
    grid-column: 1;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .normal {
    background-color: rgb(var(--m3-scheme-surface-container-lowest));
  }

  .shadowed {
    background-color: rgb(var(--m3-scheme-primary-container));
    color: rgb(var(--m3-scheme-on-primary-container));
    clip-path: inset(0 calc(100% - var(--percent)) 0 0 round 0.5rem);
  }

  .percent {
    position: absolute;
    right: 0;
  }
</style>
