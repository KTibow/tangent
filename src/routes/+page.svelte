<script lang="ts">
  import iconConnection from "@ktibow/iconset-material-symbols/cable-rounded";
  import iconWarning from "@ktibow/iconset-material-symbols/warning-rounded";
  import { m3Indicator } from "kreations";
  import { onMount } from "svelte";
  import { Button, Icon, TextFieldOutlined } from "m3-svelte";
  import { page } from "$app/state";
  import Interruption from "$lib/Interruption.svelte";
  import S3 from "$lib/api/s3";
  import App from "./App.svelte";

  let { data } = $props();
  const { jwt } = data;

  let storageEndpoint = $state(localStorage.storageEndpoint || "");
  let storageBucket = $state(localStorage.storageBucket || "");
  let keyId = $state(localStorage.keyId || "");
  let keySecret = $state(localStorage.keySecret || "");
  $effect(() => {
    localStorage.storageEndpoint = storageEndpoint;
    localStorage.storageBucket = storageBucket;
    localStorage.keyId = keyId;
    localStorage.keySecret = keySecret;
  });

  let connection: "connecting" | "will-connect" | "nothing" = $state("will-connect");
  let client: S3 | undefined = $state();
  const getStorage = async () => {
    connection = "connecting";
    try {
      const _client = new S3(storageEndpoint, storageBucket, keyId, keySecret);
      await _client.listFiles();
      client = _client;
    } finally {
      connection = "nothing";
    }
  };

  onMount(() => {
    console.log(localStorage.storageEndpoint);
    if (storageEndpoint) {
      console.log("route a");
      getStorage();
    } else {
      console.log("route b");
      setTimeout(() => {
        if (connection == "will-connect") {
          storageEndpoint = "todo";
          storageBucket = "todo";
          keyId = "todo";
          keySecret = "todo";
          getStorage();
        }
      }, 1000);
    }
  });
</script>

{#if client}
  <App {client} />
{:else}
  <Interruption
    icon={connection == "connecting" ? m3Indicator : iconConnection}
    headline={connection == "connecting" || connection == "will-connect" ? "Connecting" : "Connect"}
  >
    {#if connection == "connecting"}
      <p>Hold on...</p>
    {:else if connection == "will-connect"}
      <p>1 second.</p>
    {:else if connection == "nothing"}
      <div class="stack">
        <TextFieldOutlined name="Storage endpoint" bind:value={storageEndpoint} />
        <TextFieldOutlined name="Storage bucket" bind:value={storageBucket} />
        <TextFieldOutlined name="Key ID" bind:value={keyId} />
        <TextFieldOutlined name="Secret key" bind:value={keySecret} />
        <p class="warning">
          <Icon icon={iconWarning} />
          Since Tangent connects directly to storage, make sure CORS and CORS headers are 100% on
        </p>
      </div>
    {/if}
    {#snippet buttons()}
      {#if connection == "will-connect"}
        <Button variant="text" click={() => (connection = "nothing")}>I have my own storage</Button>
      {:else if connection == "nothing"}
        <Button variant="filled" click={getStorage}>Connect</Button>
      {/if}
    {/snippet}
  </Interruption>
{/if}

<style>
  .stack {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .warning {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: rgb(var(--m3-scheme-primary));
    > :global(svg) {
      flex-shrink: 0;
    }
  }
</style>
