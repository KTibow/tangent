<script lang="ts">
  import {
    argbFromHex,
    ContrastCurve,
    DynamicColor,
    DynamicScheme,
    Hct,
    MaterialDynamicColors,
    TonalPalette,
    Variant,
  } from "@ktibow/material-color-utilities-nightly";
  import { Button } from "m3-svelte";
  import { browser } from "$app/environment";
  import { getStorage } from "$lib/sdk/storage";

  const storage = getStorage();
  const getColors = () => {
    const materialColors = new MaterialDynamicColors();
    const onOnPrimary = DynamicColor.fromPalette({
      name: "on_on_primary",
      palette: (s) => s.primaryPalette,
      background: () => materialColors.onPrimary(),
      contrastCurve: () => new ContrastCurve(6, 6, 7, 11),
    });
    const primaryContainerSubtle = DynamicColor.fromPalette({
      name: "primary_container_subtle",
      palette: (s) => s.primaryPalette,
      isBackground: true,
      background: (s) => materialColors.highestSurface(s),
      contrastCurve: () => undefined,
    });
    const onPrimaryContainerSubtle = DynamicColor.fromPalette({
      name: "on_primary_container_subtle",
      palette: (s) => s.primaryPalette,
      background: () => primaryContainerSubtle,
      contrastCurve: () => new ContrastCurve(6, 6, 7, 11),
    });
    const tertiaryContainerSubtle = DynamicColor.fromPalette({
      name: "tertiary_container_subtle",
      palette: (s) => s.tertiaryPalette,
      isBackground: true,
      background: (s) => materialColors.highestSurface(s),
      contrastCurve: () => undefined,
    });
    const onTertiaryContainerSubtle = DynamicColor.fromPalette({
      name: "on_tertiary_container_subtle",
      palette: (s) => s.tertiaryPalette,
      background: () => tertiaryContainerSubtle,
      contrastCurve: () => new ContrastCurve(6, 6, 7, 11),
    });
    const errorContainerSubtle = DynamicColor.fromPalette({
      name: "error_container_subtle",
      palette: (s) => s.errorPalette,
      isBackground: true,
      background: (s) => materialColors.highestSurface(s),
      contrastCurve: () => undefined,
    });
    const onErrorContainerSubtle = DynamicColor.fromPalette({
      name: "on_error_container_subtle",
      palette: (s) => s.errorPalette,
      background: () => errorContainerSubtle,
      contrastCurve: () => new ContrastCurve(6, 6, 7, 11),
    });
    return [
      ...materialColors.allColors,
      materialColors.shadow(),
      materialColors.scrim(),
      onOnPrimary,
      primaryContainerSubtle,
      onPrimaryContainerSubtle,
      tertiaryContainerSubtle,
      onTertiaryContainerSubtle,
      errorContainerSubtle,
      onErrorContainerSubtle,
    ];
  };

  let color = $state("#cc63a1");

  $effect(() => {
    if (!browser) return;
    // TODO: make this handle the "existing css" case better

    const hct = Hct.fromInt(argbFromHex(color));
    const tertiaryPalette =
      348 <= hct.hue && hct.hue < 349 ? TonalPalette.fromHueAndChroma(50, 56) : undefined;
    const light = new DynamicScheme({
      sourceColorHct: hct,
      tertiaryPalette,
      isDark: false,
      variant: Variant.VIBRANT,
      contrastLevel: 0,
      specVersion: "2025",
    });
    const dark = new DynamicScheme({
      sourceColorHct: hct,
      tertiaryPalette,
      isDark: true,
      variant: Variant.VIBRANT,
      contrastLevel: 0,
      specVersion: "2025",
    });

    const genColorVariable = (name: string, argb: number) => {
      const kebabCase = name.replaceAll("_", "-");
      const red = (argb >> 16) & 255;
      const green = (argb >> 8) & 255;
      const blue = argb & 255;
      return `--m3-scheme-${kebabCase}: ${red} ${green} ${blue};`;
    };
    const colors = getColors();
    const lightColors = colors
      .map((color) => genColorVariable(color.name, color.getArgb(light)))
      .join("\n");
    const darkColors = colors
      .map((color) => genColorVariable(color.name, color.getArgb(dark)))
      .join("\n");
    const css = `@media (prefers-color-scheme: light) {
:root, ::backdrop {
${lightColors}
}
}
@media (prefers-color-scheme: dark) {
:root, ::backdrop {
${darkColors}
}
}`;
    storage[".config/styles.css"] = css;
  });
</script>

<h2 class="m3-font-headline-large">Color</h2>
<div class="controls">
  <input type="color" id="color-picker" bind:value={color} />
  <Button variant="filled" for="color-picker">Pick</Button>
  <Button variant="text" disabled={color == "#cc63a1"} click={() => (color = "#cc63a1")}>
    Reset
  </Button>
</div>
<h2 class="m3-font-headline-large">Mode</h2>
<p>
  To switch Tangent to
  <span class="hide-if-light">light</span><span class="hide-if-dark">dark</span>
  mode, open your system settings.
</p>

<style>
  :is(h2, div, p):not(:first-child) {
    margin-top: 0.5em;
  }
  .controls {
    display: flex;
    gap: 0.5rem;
  }
  input {
    width: 0;
    margin-right: -0.5rem;
  }
  @media (prefers-color-scheme: light) {
    .hide-if-light {
      display: none;
    }
  }
  @media (prefers-color-scheme: dark) {
    .hide-if-dark {
      display: none;
    }
  }
</style>
