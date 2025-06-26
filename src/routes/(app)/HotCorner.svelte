<script lang="ts">
  import { listen } from "$lib/sdk/comms-tangent";
  import { Spring } from "svelte/motion";

  let { overviewing = $bindable() }: { overviewing: boolean } = $props();
  let openedAt = 0;
  const trigger = () => {
    if (overviewing) {
      if (Date.now() - openedAt < 300) return;
      overviewing = false;
    } else {
      openedAt = Date.now();
      overviewing = true;
    }
  };

  let mouse = $state({ x: 0, y: 0 });
  let trail = new Spring({ x: 0, y: 0 }, { stiffness: 0.1, damping: 1 });
  let triggerTimeout = $state(0);
  $effect(() => {
    trail.target = mouse;
  });
  $effect(() => {
    const predictionX = mouse.x + (mouse.x - trail.current.x);
    const predictionY = mouse.y + (mouse.y - trail.current.y);
    const isTriggered =
      predictionX < 100 && predictionY < 32 && (predictionX < -16 || predictionY < -16);
    if (isTriggered) {
      triggerTimeout ||= setTimeout(trigger, 200);
    } else {
      clearTimeout(triggerTimeout);
      triggerTimeout = 0;
    }
  });

  const conditionalPull = (a: number, pull: boolean) => a + (pull ? (50 - a) * 0.5 : 0);

  listen((data) => {
    if (data.type == "keyup-alt") {
      overviewing = !overviewing;
    } else if (data.type == "mousemove") {
      mouse = { x: data.x, y: data.y };
    }
  });
</script>

<svelte:window
  onmousemove={(e) => {
    mouse = { x: e.pageX, y: e.pageY };
  }}
  onkeyup={(e) => {
    if (e.key == "Alt") {
      overviewing = !overviewing;
    }
  }}
/>
<svelte:body
  onmouseleave={(e) => {
    mouse = { x: e.pageX, y: e.pageY };
  }}
/>
<button
  class="m3-font-label-large"
  onpointerdown={(e) => {
    if (e.button == 0) trigger();
  }}
  onkeypress={(e) => {
    if (e.key == " ") trigger();
  }}
>
  <span
    style:background-position-x="{conditionalPull(overviewing ? 0 : 100, triggerTimeout > 0)}%"
    style:color="rgb({overviewing
      ? 'var(--m3-scheme-on-primary-container-subtle)'
      : 'var(--m3-scheme-on-background) / 0.8'})"
  >
    <div class="layer"></div>
    Tangent
  </span>
</button>

<style>
  button {
    display: flex;
    position: absolute;
    left: 0;
    top: 0;
    user-select: none;
    z-index: 1000;
  }
  span {
    display: flex;
    align-items: center;
    height: 2rem;
    padding: 0 1rem;
    border-radius: var(--m3-util-rounding-full);

    background-image: linear-gradient(
      to right,
      rgb(var(--m3-scheme-primary-container-subtle)) 20%,
      transparent 80%
    );
    background-size: 500% 500%;

    transition:
      background-position var(--m3-util-easing-slow),
      color var(--m3-util-easing);
  }
  .layer {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-color: currentColor;
    opacity: 0;
    &:is(button:hover .layer) {
      opacity: 0.08;
    }
    pointer-events: none;
    transition: var(--m3-util-easing);
  }
</style>
