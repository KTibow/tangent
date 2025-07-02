<script lang="ts">
  import { getStorage } from "$lib/sdk/storage";

  const storage = getStorage();
  let files = $derived(Object.keys(storage).sort());
</script>

<ul>
  {#each files as f (f)}
    <li>
      {f} ({storage[f].length}b)
      <button onclick={() => delete storage[f]}>Delete</button>
    </li>
  {/each}
</ul>
<p>{files.length} {files.length == 1 ? "file" : "files"}</p>

<style>
  li {
    display: flex;
    align-items: center;
    gap: 2rem;
    height: 3rem;
    &:not(:first-child) {
      border-top: 1px solid var(--m3-scheme-outline);
    }
    > button {
      align-self: stretch;
      color: rgb(var(--m3-scheme-primary));
    }
  }
  p {
    margin-top: 2rem;
    color: rgb(var(--m3-scheme-on-surface-variant));
  }
</style>
