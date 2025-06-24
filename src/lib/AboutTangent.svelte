<script>
  import { Icon } from "m3-svelte";
  import { iconTangent } from "./icons";
</script>

<div class="about-tangent m3-font-headline-large">
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
  .about-tangent {
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
    @media (width < 100rem) {
      display: grid;
      grid-template-columns: auto auto auto;
      align-self: start;
    }
    p,
    strong {
      display: inline-flex;
      align-items: center;
      vertical-align: middle;
      gap: 0.5rem;
    }
    column-gap: 1ch;
  }
</style>
