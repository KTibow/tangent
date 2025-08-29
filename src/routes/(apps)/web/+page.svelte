<script lang="ts">
  import iconBack from "@ktibow/iconset-material-symbols/arrow-back-rounded";
  import iconForward from "@ktibow/iconset-material-symbols/arrow-forward-rounded";
  import iconRefresh from "@ktibow/iconset-material-symbols/refresh-rounded";
  import { BareMuxConnection } from "@mercuryworkshop/bare-mux";
  import { Layer } from "m3-svelte";
  import { onMount } from "svelte";
  import Icon from "$lib/Icon.svelte";
  import baremuxWorkerURL from "./assets/baremux-worker.js?url";
  import epoxyWorkerURL from "./assets/epoxy-worker.js?url";
  import homePage from "./homePage.txt?raw";

  let iframe: HTMLIFrameElement | undefined = $state();
  let inputValue = $state("");
  let history = $state<string[]>([]);
  let index = $state(-1);
  onMount(() => {
    // Initialize Scramjet/service worker as early as possible
    load();

    const blobUrl = URL.createObjectURL(new Blob([homePage], { type: "text/html" }));
    iframe!.src = blobUrl;
  });

  const PREFIX = "/webpage/";
  const ENCODE = (url: string) => encodeURIComponent(url);
  const DECODE = (url: string) => decodeURIComponent(url);

  const toProxied = (url: string) => `${PREFIX}${ENCODE(url)}`;
  const fromProxied = (fullUrl: string) => {
    const idx = fullUrl.indexOf(PREFIX);
    if (idx === -1) return fullUrl;
    const encoded = fullUrl.slice(idx + PREFIX.length);
    try {
      return DECODE(encoded);
    } catch {
      return fullUrl;
    }
  };

  let loaded = false;
  const load = async () => {
    if (loaded) return;
    loaded = true;

    if (!navigator.serviceWorker) {
      if (location.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(location.hostname))
        throw new Error("Service workers cannot be registered without https.");

      throw new Error("Your browser doesn't support service workers.");
    }

    // @ts-expect-error not typedefing this
    const { ScramjetController } = globalThis.$scramjetLoadController();
    const scramjet = new ScramjetController({
      prefix: PREFIX,
      files: {
        all: "WEB_ASSET(scramjet.all.js)",
        sync: "WEB_ASSET(scramjet.sync.js)",
        wasm: "WEB_ASSET(scramjet.wasm.wasm)",
      },
    });
    await scramjet.init();
    await navigator.serviceWorker.register("WEB_ASSET(the-sw.js)", {
      scope: "/",
    });

    const conn = new BareMuxConnection(baremuxWorkerURL);
    await conn.setTransport(epoxyWorkerURL, [{ wisp: "wss://gointospace.app/wisp/" }]);
  };

  const normalizeInputToUrl = (raw: string) => {
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
    return url;
  };

  const go = async (raw: string) => {
    if (!raw) return;
    const url = normalizeInputToUrl(raw);

    inputValue = url;

    if (index < history.length - 1) {
      history = history.slice(0, index + 1);
    }
    history = [...history, url];
    index = index + 1;

    await load();
    iframe!.src = toProxied(url);
  };

  const goBack = () => {
    if (index > 0) {
      index = index - 1;
      const url = history[index];
      iframe!.src = toProxied(url);
      inputValue = url;
    }
  };

  const goForward = () => {
    if (index < history.length - 1) {
      index = index + 1;
      const url = history[index];
      iframe!.src = toProxied(url);
      inputValue = url;
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

      const realUrl = fromProxied(url);
      inputValue = realUrl;

      if (history[index] !== realUrl) {
        if (index < history.length - 1) {
          history = history.slice(0, index + 1);
        }
        history = [...history, realUrl];
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

<svelte:head>
  <script src="WEB_ASSET(scramjet.all.js)"></script>
</svelte:head>
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
