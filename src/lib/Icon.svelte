<script lang="ts">
  import type { IconifyIcon } from "@iconify/types";

  let {
    icon,
    width = "1em",
    height = "1em",
  }: {
    icon: IconifyIcon;
    width?: string;
    height?: string;
  } = $props();
</script>

<svg {width} {height} viewBox="0 0 {icon.width} {icon.height}">
  {@html icon.body}
</svg>
