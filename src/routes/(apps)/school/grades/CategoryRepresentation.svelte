<script lang="ts">
  import iconTriangle from "@ktibow/iconset-material-symbols/change-history-rounded";
  import iconPentagon from "@ktibow/iconset-material-symbols/pentagon-rounded";
  import Icon from "$lib/Icon.svelte";

  let { category }: { category: string } = $props();
  const iconDiamond = {
    width: 24,
    height: 24,
    body: `<path fill="currentColor" d="M12 22q-.4 0-.763-.137t-.637-.438l-7.975-8q-.275-.3-.45-.663T2 12t.175-.763t.45-.637l7.975-8q.3-.3.65-.45T12 2t.775.15t.65.45l7.95 8q.275.3.45.65T22 12t-.162.763t-.463.662l-7.95 8q-.275.275-.65.425T12 22"/>`,
  };
</script>

{#if category == "assignment"}
  <div></div>
{:else if category == "project"}
  <Icon icon={iconTriangle} />
{:else if category == "test"}
  <Icon icon={iconDiamond} />
{:else}
  <Icon icon={iconPentagon} />
{/if}
