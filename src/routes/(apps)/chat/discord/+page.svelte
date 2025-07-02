<script>
  import { Layer } from "m3-svelte";
  import { isLikelyFiltered } from "$lib";
  import BoxFloating from "$lib/BoxFloating.svelte";
  import MessagesTemplate from "../MessagesTemplate.svelte";

  let { data } = $props();
  let me = $state("TODO: name");

  let ps = $derived({
    isDiscord: true,
    me,
    location: "Global chat",
    menu,
    box,
  });
</script>

{#snippet menu()}
  {#if isLikelyFiltered}
    <p>This is a portal to Discord - https://discord.gg/KXFh6rP86W</p>
  {:else}
    <p>This is a portal to <a target="_blank" href="https://discord.gg/KXFh6rP86W">Discord</a></p>
  {/if}
  <a href="/chat/messages">
    <Layer />
    Portal to Google Messages
  </a>
{/snippet}
{#snippet box()}
  <BoxFloating values={{ username: me }} />
{/snippet}

{#await data.messages}
  <MessagesTemplate {...ps} messages={[]} />
{:then messages}
  <MessagesTemplate {...ps} {messages} />
{/await}
