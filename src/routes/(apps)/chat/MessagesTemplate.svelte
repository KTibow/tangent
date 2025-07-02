<script lang="ts">
  import iconDropdown from "@ktibow/iconset-material-symbols/arrow-drop-down-rounded";
  import iconReply from "@ktibow/iconset-material-symbols/subdirectory-arrow-right-rounded";
  import { Layer } from "m3-svelte";
  import type { Snippet } from "svelte";
  import Icon from "$lib/Icon.svelte";
  import type { Message } from "./types";

  let {
    hasAuthors = true,
    me,
    location,
    messages,
    menu,
    box,
  }: {
    hasAuthors?: boolean;
    me: string;
    location: string;
    messages: Message[] | undefined;
    menu: Snippet;
    box: Snippet;
  } = $props();

  const closeOnClick = (node: HTMLDetailsElement) => {
    const close = (e: Event) => {
      if (e.target instanceof Element && e.target.closest("summary")) return;
      node.open = false;
    };
    window.addEventListener("click", close);
    return {
      destroy() {
        window.removeEventListener("click", close);
      },
    };
  };

  const isSeparate = (m1: Message, m2: Message) => {
    if (!m1) return true;
    if (!m2) return true;
    if (m1.timestamp.toLocaleDateString() != m2.timestamp.toLocaleDateString()) {
      return true;
    }
    if (m1.author != m2.author) {
      return true;
    }
    return false;
  };
  const display = (messages: Message[]) => {
    messages = messages.toSorted((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    let output: (
      | {
          type: "message";
          margin: string;
          text: string;
          id: string;
          reply?: { id: string; text: string };
          start: boolean;
          end: boolean;
          highlight: boolean;
          announcement: boolean;
        }
      | {
          type: "author";
          text: string;
          margin: string;
          id: string;
          reply?: never;
          start?: never;
          end?: never;
          highlight?: never;
          announcement: boolean;
        }
    )[] = [];
    for (let i = 0; i < messages.length; i++) {
      const prevMessage = messages[i - 1];
      const message = messages[i];
      const nextMessage = messages[i + 1];

      let margin = 0;
      if (prevMessage && prevMessage.author != message.author) {
        margin = 0.5;
      }
      if (
        prevMessage &&
        prevMessage.timestamp.toLocaleDateString() != message.timestamp.toLocaleDateString()
      ) {
        margin = 4;
      }
      if (hasAuthors && prevMessage?.author != message.author && me != message.author) {
        output.push({
          type: "author",
          text: message.author,
          margin: `${margin}rem`,
          id: `${message.id}-author`,
          announcement: message.announcement,
        });
        margin = 0;
      }

      output.push({
        type: "message",
        margin: `${margin}rem`,
        text: message.text,
        id: message.id,
        reply: message.reply,
        start: isSeparate(prevMessage, message),
        end: isSeparate(message, nextMessage),
        highlight: me == message.author,
        announcement: message.announcement,
      });
    }

    return output;
  };
</script>

<main>
  <!-- todo: location indicator -->
  {#if messages}
    <div class="messages">
      {#each display(messages) as { type, margin, text, id, reply, start, end, highlight, announcement } (id)}
        {#if type == "author"}
          <p class="author" class:announcement style:margin-top={margin}>{text}</p>
        {:else if type == "message"}
          <div
            class="message"
            class:highlight
            class:announcement
            class:start
            class:end
            style:margin-top={margin}
            {id}
          >
            {#if reply}
              <a href="#{reply.id}" class="reply">
                <Icon icon={iconReply} width="1.25rem" height="1.25rem" />
                {reply.text}
              </a>
            {/if}
            <p>{text}</p>
          </div>
        {/if}
      {/each}
    </div>
    {@render box()}
  {/if}
  <details use:closeOnClick>
    <summary>
      <Layer />
      {location}
      <Icon icon={iconDropdown} />
    </summary>
    <div class="menu">
      {@render menu()}
    </div>
  </details>
</main>

<style>
  :root {
    --preferred-top-inset: 3.5rem;
  }
  main {
    display: flex;
    flex-direction: column-reverse;
    flex-grow: 1;
    padding-inline: 1.5rem;
    padding-top: var(--top-inset);
    padding-bottom: var(--bottom-inset);
    overflow: auto;
  }

  details {
    position: fixed;
    top: 0.5rem;
    left: 50%;
    translate: -50% 0;

    > summary {
      display: flex;
      gap: 0.25rem;
      align-items: center;
      height: 2.5rem;
      padding: 0 1rem;
      border-radius: var(--m3-util-rounding-full);
      background-color: rgb(var(--m3-scheme-surface-container-low));

      cursor: pointer;

      > :global(svg) {
        transition: var(--m3-util-easing-fast);
        &:is(details[open] :global(svg)) {
          rotate: -180deg;
        }
      }
    }
    > .menu {
      display: flex;
      flex-direction: column;

      min-width: 100%;
      white-space: nowrap;
      overflow: hidden;

      background-color: rgb(var(--m3-scheme-surface-container-low));
      border-radius: var(--m3-util-rounding-medium);

      position: absolute;
      top: 0;
      left: 50%;
      translate: -50% 0;
      transition: var(--m3-util-easing-slow);

      @starting-style {
        height: 0;
      }

      > :global(*) {
        display: flex;
        gap: 0.25rem;
        padding: 0 1rem;
        align-items: center;
        height: 2.5rem;
        position: relative;
      }
      :global(a),
      :global(button) {
        display: flex;
        align-items: center;
        align-self: stretch;
        flex-grow: 1;
        color: rgb(var(--m3-scheme-primary));
      }
    }
  }

  .messages {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .message {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    padding: 0.25rem 0.5rem;
    border-radius: 0.5rem;

    &.start {
      padding-top: 0.625rem;
      border-top-left-radius: 1rem;
      border-top-right-radius: 1rem;
    }
    &.end {
      padding-bottom: 0.625rem;
      border-bottom-left-radius: 1rem;
      border-bottom-right-radius: 1rem;
      &.start {
        border-radius: 1.25rem;
      }
    }
    &:target {
      box-shadow: inset 0 0 0 2px rgb(var(--m3-scheme-primary));
    }
    > .reply {
      display: flex;
      align-items: center;
      gap: 0.25rem;

      padding: 0.5rem 0.25rem 0.25rem 0.5rem;
      margin-top: -0.5rem;
      margin-right: -0.25rem;
      margin-bottom: -0.25rem;
      margin-left: -0.5rem;
    }

    &:not(.announcement, .highlight) {
      background-color: rgb(var(--m3-scheme-surface-container-low));
      > .reply {
        color: rgb(var(--m3-scheme-primary));
      }
    }
    &.announcement:not(.highlight) {
      background-color: rgb(var(--m3-scheme-tertiary-container-subtle));
      color: rgb(var(--m3-scheme-on-tertiary-container-subtle));
      align-self: center;
      > .reply {
        color: rgb(var(--m3-scheme-tertiary));
      }
    }
    &.highlight:not(.announcement) {
      background-color: rgb(var(--m3-scheme-primary-container-subtle));
      margin-left: 1.5rem;
      > .reply {
        color: rgb(var(--m3-scheme-primary));
      }
    }
    &.announcement.highlight {
      background-color: rgb(var(--m3-scheme-primary-container-subtle));
      align-self: center;
      > .reply {
        color: rgb(var(--m3-scheme-primary));
      }
    }

    > p {
      white-space: pre-wrap;
    }
  }
  .author {
    font-size: 0.875rem;
    font-weight: 600;
    &.announcement {
      align-self: center;
    }
  }
</style>
