<script lang="ts">
  import iconComputer from "@ktibow/iconset-material-symbols/computer-outline-rounded";
  import iconFeedback from "@ktibow/iconset-material-symbols/feedback-rounded";
  import iconFiles from "@ktibow/iconset-material-symbols/files";
  import iconAbout from "@ktibow/iconset-material-symbols/info-rounded";
  import iconTheme from "@ktibow/iconset-material-symbols/palette";
  import iconWindows from "@ktibow/iconset-material-symbols/select-window";
  import { NavCMLX, NavCMLXItem } from "m3-svelte";
  import type { Snippet } from "svelte";
  import { page } from "$app/state";

  let { children }: { children: Snippet } = $props();
  const pages = $derived({
    About: { icon: iconAbout, href: "/settings/about" },
    Feedback: { icon: iconFeedback, href: "/settings/feedback" },
    Theme: { icon: iconTheme, href: "/settings/theme" },
    ...(page.url.pathname.startsWith("/settings/devtools")
      ? {
          "Dev: files": { icon: iconFiles, href: "/settings/devtools/files" },
          "Dev: popups": { icon: iconWindows, href: "/settings/devtools/popups" },
        }
      : {
          "Dev: tools": { icon: iconComputer, href: "/settings/devtools/files" },
        }),
  });
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
