<script>
  import { Icon } from "m3-svelte";
  import { onMount } from "svelte";
  import { iconTangent } from "$lib/icons";
  import TangentContainer from "$lib/TangentContainer.svelte";
  import EmailInput from "./EmailInput.svelte";
  import PasswordInput from "./PasswordInput.svelte";
  import FaceInput from "./FaceInput.svelte";

  let { data } = $props();
  let hasCamera = $state(true);
  onMount(async () => {
    const list = await navigator.mediaDevices.enumerateDevices();
    hasCamera = list.some((device) => device.kind == "videoinput");
  });

  let canUsePassword = $derived(data.canUsePassword);
  let canUseFace = $derived(data.canUseFace && hasCamera);
  let usePassword = $derived(canUsePassword);
</script>

<div class="login">
  <TangentContainer contract>
    {#if canUsePassword && usePassword}
      <PasswordInput useFace={canUseFace ? () => (usePassword = false) : undefined} />
    {:else if canUseFace && !usePassword}
      <FaceInput usePassword={canUsePassword ? () => (usePassword = true) : undefined} />
    {:else}
      <EmailInput />
    {/if}
  </TangentContainer>
</div>
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
  .login {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    height: 90dvh;
    flex: none;
  }
  .login :global {
    .container > form {
      display: flex;
      flex-direction: column;
      margin-block: auto;
    }
    .container > .stack {
      position: relative;
      > :first-child {
        width: 20rem;
        padding: 0.5rem 1rem 3.5rem 1rem;
        background-color: rgb(var(--m3-scheme-surface-container-low));
        border-radius: 1.5rem;
      }
      > :last-child {
        position: absolute;
        bottom: 0;
        right: 0;
      }
    }
    .container > a {
      align-self: center;
    }
  }
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
