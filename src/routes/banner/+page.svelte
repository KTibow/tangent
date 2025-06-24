<script>
  import { iconTangent } from "$lib/icons";
  import TangentContainer from "$lib/TangentContainer.svelte";
  import Icon from "$lib/Icon.svelte";
</script>

<TangentContainer>
  <h1 class="m3-font-headline-large">
    <Icon icon={iconTangent} width="2rem" height="2rem" />
    Tangent
  </h1>
</TangentContainer>

<style>
  h1 {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: rgb(var(--m3-scheme-primary));
    margin: auto;
    font-weight: bold;
  }
</style>
