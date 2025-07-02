<script lang="ts">
  import { shortenCategory, simplifyCategory } from "../naming";
  import CategoryRepresentation from "./CategoryRepresentation.svelte";
  import { roundTo, getPoints, type Assignment } from "./lib";

  let {
    categories,
    assignments,
  }: {
    categories: Record<string, { earned: number; possible: number; weight: number }> | undefined;
    assignments: Assignment[];
  } = $props();
</script>

{#if categories}
  <div class="categories">
    {#each Object.entries(categories) as [name, { earned, possible, weight }] (name)}
      <div class="category" style:--weight="{weight * 100}%">
        <h3>
          {shortenCategory(name)}
          {#if weight < 1}
            <CategoryRepresentation category={simplifyCategory(name)} />
          {/if}
        </h3>
        {#if weight < 1}
          <p>
            {roundTo((earned / possible) * 100, 2)}%
            <span class="hover-only">({roundTo(earned, 2)} / {possible})</span>
          </p>
          <p>
            As {roundTo((earned / possible) * weight * 100, 1)} / {roundTo(weight * 100, 1)}%
          </p>
        {:else}
          <p>{roundTo(earned, 2)} / {possible}</p>
        {/if}
      </div>
    {/each}
  </div>
{:else}
  {@const { earned, possible } = getPoints(assignments)}
  <div class="points">
    {roundTo(earned, 2)} / {possible}
  </div>
{/if}

<style>
  .categories {
    display: flex;
    gap: 0.5rem;
    flex-grow: 1;
  }
  .category {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    line-height: 1;

    background-color: rgb(var(--m3-scheme-surface-container-low));
    padding: 0.5rem;
    border-radius: 1rem;

    flex-grow: 1;
    min-width: max-content;
    width: var(--weight);

    > h3 {
      display: flex;
      align-items: center;
      gap: 0.25rem;

      font-size: 1rem;
      font-weight: normal;
      margin-bottom: auto;

      > :global(svg) {
        color: rgb(var(--m3-scheme-tertiary));
        flex-shrink: 0;
      }
    }
    > p {
      opacity: 0.8;
    }

    .hover-only {
      transition: var(--transition);
      opacity: 0;
    }
  }
  .categories:active {
    gap: 1px;
    user-select: none;
  }
  .categories:active > .category {
    min-width: 0;
    flex-basis: var(--weight);
  }
  .categories:active > .category .hover-only {
    display: none;
  }
  .categories > .category:hover .hover-only {
    opacity: 1;
  }

  .points {
    display: flex;
    justify-content: center;

    padding: 0.5rem;
    border-radius: 1rem;
    background-color: rgb(var(--m3-scheme-surface-container-low));
  }
</style>
