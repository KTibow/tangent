<script lang="ts">
  import iconFeedback from "@ktibow/iconset-material-symbols/feedback-rounded";
  import iconAbout from "@ktibow/iconset-material-symbols/info-rounded";
  import iconTheme from "@ktibow/iconset-material-symbols/palette";
  import iconPerson from "@ktibow/iconset-material-symbols/person-rounded";
  import { NavCMLX, NavCMLXItem } from "m3-svelte";
  import type { Snippet } from "svelte";
  import { page } from "$app/state";
  import SDK from "$lib/sdk/SDK.svelte";

  let { children }: { children: Snippet } = $props();
  const pages = {
    Authorization: { icon: iconPerson, href: "/settings/authorization" },
    Theme: { icon: iconTheme, href: "/settings/theme" },
    Feedback: { icon: iconFeedback, href: "/settings/feedback" },
    About: { icon: iconAbout, href: "/settings/about" },
  };
</script>

<SDK>
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
</SDK>

<style>
  :root {
    --preferred-top-inset: 2.5rem;
  }
  .layout {
    display: grid;
    grid-template-columns: auto 1fr;
    > :global(*) {
      padding-top: var(--top-inset) !important;
    }
  }
  main {
    display: flex;
    flex-direction: column;
  }
</style>
