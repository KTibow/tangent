<script lang="ts">
  import { Spring } from "svelte/motion";

  let { overviewing, trigger }: { overviewing: boolean; trigger: () => void } = $props();

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
</script>

<svelte:window
  onmousemove={(e) => {
    mouse = { x: e.pageX, y: e.pageY };
  }}
/>
<button
  class="m3-font-label-large"
  onpointerdown={(e) => {
    if (e.button == 0) trigger();
  }}
>
  <span
    style:background-position-x="{conditionalPull(overviewing ? 0 : 100, triggerTimeout > 0)}%"
    style:color="rgb(var({overviewing
      ? '--m3-scheme-on-primary-container'
      : '--m3-scheme-on-surface-variant'}))">Tangent</span
  >
</button>

<style>
  button {
    display: flex;
    position: absolute;
    left: 0;
    top: 0;
  }
  @property --base-bg {
    syntax: "<color>";
    initial-value: transparent;
    inherits: false;
  }
  span {
    display: flex;
    align-items: center;
    height: 2rem;
    padding: 0 0.75rem;
    border-radius: var(--m3-util-rounding-full);

    &:is(button:hover span) {
      --base-bg: rgb(var(--m3-scheme-surface-container));
    }

    background-image: linear-gradient(
      to right,
      rgb(var(--m3-scheme-primary-container)) 20%,
      var(--base-bg) 80%
    );
    background-size: 500% 500%;

    transition:
      --base-bg var(--m3-util-easing),
      background-position var(--m3-util-easing-slow),
      color var(--m3-util-easing);
  }
</style>
