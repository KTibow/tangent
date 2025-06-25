<script lang="ts">
  import iconTheme from "@ktibow/iconset-material-symbols/palette";
  import iconFeedback from "@ktibow/iconset-material-symbols/feedback-rounded";
  import iconAbout from "@ktibow/iconset-material-symbols/info-rounded";
  import { NavCMLX, NavCMLXItem } from "m3-svelte";
  import type { Snippet } from "svelte";
  import { page } from "$app/state";

  import "$lib/sdk/index.js";

  let { children }: { children: Snippet } = $props();
  const pages = {
    Theme: { icon: iconTheme, href: "/settings/theme" },
    Feedback: { icon: iconFeedback, href: "/settings/feedback" },
    About: { icon: iconAbout, href: "/settings/about" },
  };
</script>

<div class="layout">
  <NavCMLX variant="expanded">
    {#each Object.entries(pages) as [name, { icon, href }] (href)}
      <NavCMLXItem
        variant="expanded"
        text={name}
        {icon}
        {href}
        selected={page.url.pathname == href}
      />
    {/each}
  </NavCMLX>
  <main>
    {@render children()}
  </main>
</div>

<style>
  .layout {
    display: grid;
    grid-template-columns: auto 1fr;
    padding-top: calc(var(--top-inset) - 1.5rem + 0.5rem);
  }
  main {
    display: flex;
    flex-direction: column;
    padding-block: 1.5rem;
  }
</style>
