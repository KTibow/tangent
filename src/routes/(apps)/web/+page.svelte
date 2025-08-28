<script lang="ts">
  import iconBack from "@ktibow/iconset-material-symbols/arrow-back-rounded";
  import iconForward from "@ktibow/iconset-material-symbols/arrow-forward-rounded";
  import iconRefresh from "@ktibow/iconset-material-symbols/refresh-rounded";
  import { Layer } from "m3-svelte";
  import { onMount } from "svelte";
  import Icon from "$lib/Icon.svelte";
  import homePage from "./homePage.txt?raw";

  let iframe: HTMLIFrameElement | undefined = $state();
  let inputValue = $state("");
  let history = $state<string[]>([]);
  let index = $state(-1);
  onMount(() => {
    const blobUrl = URL.createObjectURL(new Blob([homePage], { type: "text/html" }));
    iframe!.src = blobUrl;
  });

  const go = (raw: string) => {
    if (!raw) return;
    let url = raw.trim();

    const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url);
    if (!hasScheme) {
      if (/\s/.test(url)) {
        url = `https://duckduckgo.com/?q=${encodeURIComponent(url)}`;
      } else if (url.includes(".")) {
        url = `https://${url}`;
      } else {
        url = `https://duckduckgo.com/?q=${encodeURIComponent(url)}`;
      }
    }

    inputValue = url;

    if (index < history.length - 1) {
      history = history.slice(0, index + 1);
    }
    history = [...history, url];
    index = index + 1;

    iframe!.src = url;
  };

  const goBack = () => {
    if (index > 0) {
      index = index - 1;
      iframe!.src = history[index];
      inputValue = history[index];
    }
  };

  const goForward = () => {
    if (index < history.length - 1) {
      index = index + 1;
      iframe!.src = history[index];
      inputValue = history[index];
    }
  };

  const reload = () => {
    if (iframe?.src) {
      const current = iframe.src;
      iframe.src = current;
    }
  };

  const setupIframe = (node: HTMLIFrameElement) => {
    const onLoad = () => {
      const url = node.src;
      if (!url || url == "about:blank" || url.startsWith("blob:")) return;

      inputValue = url;

      if (history[index] !== url) {
        if (index < history.length - 1) {
          history = history.slice(0, index + 1);
        }
        history = [...history, url];
        index = index + 1;
      }
    };

    node.addEventListener("load", onLoad);
    return {
      destroy() {
        node.removeEventListener("load", onLoad);
      },
    };
  };
</script>

<div class="wrapper">
  <iframe
    title="Web"
    allow="autoplay; camera; clipboard-read; clipboard-write; encrypted-media; fullscreen; geolocation; microphone; payment"
    bind:this={iframe}
    use:setupIframe
  ></iframe>
  <div class="controls">
    <button disabled={index <= 0} onclick={goBack} aria-label="Back">
      <Layer />
      <Icon icon={iconBack} />
    </button>
    <button
      disabled={index < 0 || index >= history.length - 1}
      onclick={goForward}
      aria-label="Forward"
    >
      <Layer />
      <Icon icon={iconForward} />
    </button>
    <button onclick={reload} aria-label="Reload">
      <Layer />
      <Icon icon={iconRefresh} />
    </button>
    <input
      class="focus-inset"
      type="url"
      placeholder="Enter URL or search"
      bind:value={inputValue}
      onkeydown={(e) => e.key == "Enter" && go(inputValue)}
      spellcheck="false"
    />
  </div>
</div>

<style>
  .wrapper {
    display: grid;
    flex-grow: 1;
    grid-auto-flow: column;
    grid-template-columns: 1fr auto;
    grid-template-rows: 1fr auto;
  }

  iframe {
    align-self: stretch;
    justify-self: stretch;
    width: 100%;
    height: 100%;
    border: none;
  }

  .controls {
    display: flex;
    height: 3rem;
    gap: 0.25rem;

    > button {
      display: flex;
      align-items: center;
      justify-content: center;

      padding: 0 0.5rem;
      border-radius: 1rem;
      position: relative;

      &:disabled {
        opacity: 0.38;
      }
    }

    > input {
      padding: 0 1rem;
      border-radius: 1rem;
      flex-grow: 1;
      min-width: 8rem;
    }
  }
</style>
