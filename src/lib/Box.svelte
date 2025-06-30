<script module>
  import { writable } from "svelte/store";

  const persistentState = writable({
    selectionStart: 0,
    selectionEnd: 0,
    hasFocus: false,
  });
</script>

<script lang="ts">
  import iconSend from "@ktibow/iconset-material-symbols/send-rounded";
  import iconStop from "@ktibow/iconset-material-symbols/stop-rounded";
  import { Layer } from "m3-svelte";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import Icon from "$lib/Icon.svelte";
  import { content } from "./box-data";

  type Submission =
    | {
        submit: (text: string) => void;
        action?: never;
        method?: never;
        values?: never;
      }
    | { submit?: never; action?: string; method?: "POST"; values: Record<string, string> };
  let {
    abort,
    submit,
    action,
    method = "POST",
    values,
  }: {
    abort?: () => void;
  } & Submission = $props();

  let field: HTMLTextAreaElement;
  let form: HTMLFormElement;

  let hasContent = $derived($content.trim().length > 0);
  let canSubmit = $derived(hasContent && !abort);

  let innerWidth = $state(0);
  let isSmall = $derived(innerWidth && innerWidth < 60 * 16);

  const resize = (node: HTMLElement) => {
    $effect(() => {
      $content;
      node.style.height = "auto";
      node.style.height = node.scrollHeight + "px";
    });
  };

  function handleSubmit(event: SubmitEvent) {
    const contentClean = $content.trim();

    if (!contentClean || abort) {
      event.preventDefault();
      return;
    }

    if (submit) {
      event.preventDefault();
      $content = "";
      submit(contentClean);
    }
  }

  onMount(() => {
    const state = $persistentState;
    if (field && state) {
      field.selectionStart = state.selectionStart;
      field.selectionEnd = state.selectionEnd;
      if (state.hasFocus) {
        field.focus();
      }
    }
  });

  function handleFocus() {
    $persistentState = { ...$persistentState, hasFocus: true };
  }

  function handleBlur() {
    $persistentState = { ...$persistentState, hasFocus: false };
  }

  function handleSelect() {
    $persistentState = {
      ...$persistentState,
      selectionStart: field.selectionStart,
      selectionEnd: field.selectionEnd,
    };
  }
</script>

<svelte:window bind:innerWidth />

<form bind:this={form} onsubmit={handleSubmit} {...submit ? {} : { action, method }}>
  {#if values}
    {#each Object.entries(values) as [key, value] (key)}
      <input type="hidden" name={key} {value} />
    {/each}
  {/if}

  <textarea
    class="focus-none"
    name="content"
    placeholder={isSmall ? "Type something" : "Type something, anything"}
    rows="2"
    required
    disabled={!!abort}
    use:resize
    bind:this={field}
    bind:value={$content}
    onfocus={handleFocus}
    onblur={handleBlur}
    onselect={handleSelect}
    oninput={handleSelect}
    onkeypress={(e) => {
      if (e.key == "Enter" && !e.shiftKey) {
        e.preventDefault();
        e.currentTarget.form?.requestSubmit();
      }
    }}
  ></textarea>

  {#if abort}
    <button
      type="button"
      class="focus-none abort-btn"
      onclick={abort}
      transition:fade={{ duration: 100 }}
    >
      <Layer />
      <Icon icon={iconStop} />
    </button>
  {:else if canSubmit}
    <button type="submit" class="focus-none submit-btn" transition:fade={{ duration: 100 }}>
      <Layer />
      <Icon icon={iconSend} />
    </button>
  {/if}
</form>

<style>
  textarea {
    padding: 0.5rem 3rem 0.5rem 1rem;
    resize: none;
    flex: 1;
    min-width: 0;
  }

  textarea:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    border-radius: 1.5rem;
    color: rgb(var(--m3-scheme-primary));

    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
  }

  .abort-btn {
    color: rgb(var(--m3-scheme-error));
  }
</style>
