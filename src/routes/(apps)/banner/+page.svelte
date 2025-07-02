<script>
  import Icon from "$lib/Icon.svelte";
  import TangentContainer from "$lib/TangentContainer.svelte";
  import { iconTangent } from "$lib/icons";
</script>

<TangentContainer>
  <h1 class="m3-font-display-large">
    <Icon icon={iconTangent} width="6rem" height="6rem" />
    Tangent
  </h1>
</TangentContainer>

<style>
  /* Best viewed at 1280x640 */
  h1 {
    display: inline-flex;
    align-items: center;
    gap: 0.125em;
    color: rgb(var(--m3-scheme-primary));
    margin: auto;

    font-size: 6rem;
    font-weight: bold;
  }
</style>
