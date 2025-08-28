<script lang="ts">
  import iconCheck from "@ktibow/iconset-material-symbols/check-rounded";
  import { Button } from "m3-svelte";
  import districts from "school-districts";
  import { tick } from "svelte";
  import Icon from "$lib/Icon.svelte";
  import { send } from "$lib/sdk/comms-app";
  import { AUTH_PATH, getStorage } from "$lib/sdk/storage";
  import EmailInput from "./EmailInput.svelte";

  const storage = getStorage();
  let auth = $derived(storage[AUTH_PATH]);
  let districtCount = $derived(Object.keys(districts).length);

  let email = $state("");
  let password = $state("");

  const demo = async () => {
    storage[AUTH_PATH] = JSON.stringify({
      email: "demo@example.com",
      password: "not_real_password",
    });
    await tick();
    await tick();
    send!({ type: "close" });
  };
</script>

<h2 class="m3-font-headline-large">Authorization</h2>
{#if auth}
  <p>
    <Icon icon={iconCheck} /> Stored locally.
  </p>
{:else}
  <form
    autocomplete="off"
    onsubmit={async (e) => {
      e.preventDefault();

      storage[AUTH_PATH] = JSON.stringify({ email, password });

      await tick();

      await tick();

      send!({ type: "close" });
    }}
  >
    <EmailInput bind:email />
    <input
      class="focus-inset"
      type="password"
      placeholder="Password"
      required
      bind:value={password}
    />
    <Button variant="filled">Store</Button>
  </form>
  <p>For this demo, you can just hit this button to log in.</p>
  <div>
    <Button onclick={demo}>Log in as a demo user</Button>
  </div>
  <p class="note">
    Tangent currently supports {districtCount}
    {districtCount == 1 ? "district" : "districts"}.
  </p>
{/if}

<style>
  :is(h2, p, form):not(:first-child) {
    margin-top: 0.5em;
  }
  p {
    display: flex;
    gap: 0.25rem;
    align-items: center;
    &.note {
      opacity: 0.8;
      margin-top: auto;
    }
  }
  form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: start;
  }
  form :global(input) {
    width: 20rem;
    height: 3rem;
    padding: 0 1rem;
    border-radius: var(--m3-util-rounding-medium);
    background-color: rgb(var(--m3-scheme-surface-container-low));
  }
</style>
