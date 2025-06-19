<script>
  import { Icon } from "m3-svelte";
  import Login from "./Login.svelte";
  import { iconTangent } from "$lib/icons";
</script>

<Login />
<div class="yap m3-font-headline-large">
  <div class="grid">
    <p>If the computer is</p>
    <p>a bicycle</p>
    <p>for the mind,</p>
    <p>
      <strong style:color="rgb(var(--m3-scheme-primary))">
        <Icon icon={iconTangent} width="2rem" height="2rem" />
        Tangent
      </strong> is
    </p>
    <p>a computer</p>
    <p>for school.</p>
  </div>
  <p>
    Tangent has changed a lot over time, but we think this version of Tangent is the best yet. It's
    got everything you need to learn more and more efficiently throughout your school day.
  </p>
</div>

<style>
  .yap {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    gap: 1.5rem;
    background-color: rgb(var(--m3-scheme-surface-container-lowest));
  }
  p {
    max-width: 80ch;
  }
  .grid {
    display: grid;
    grid-template-columns: auto auto auto;
    align-self: start;
    column-gap: 1.5rem;
    p,
    strong {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }
</style>
