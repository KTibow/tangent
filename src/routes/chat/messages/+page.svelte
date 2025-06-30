<script lang="ts">
  import InMessageListConversations from "codec/InMessageListConversations";
  import InMessageListMessages from "codec/InMessageListMessages";
  import InMessageUpdates from "codec/InMessageUpdates";
  import { ActionType } from "codec/OutExecute";
  import OutExecuteListMessages from "codec/OutExecuteListMessages";
  import OutExecuteMessage from "codec/OutExecuteMessage";
  import { Layer } from "m3-svelte";
  import { untrack } from "svelte";
  import { goto } from "$app/navigation";
  import BoxFloating from "$lib/BoxFloating.svelte";
  import { devalueToValueAsync, intarrToB64, valueToDevalueAsync } from "$lib/data-conversion";
  import { requestClose } from "$lib/sdk/comms-app";
  import { getStorage } from "$lib/sdk/storage";
  import MessagesTemplate from "../MessagesTemplate.svelte";
  import type { Message, Link } from "../types";
  import { connect, DATA_PATH, execute, refresh } from "./comms";

  const convertGMessage = (message: {
    id: string;
    status: number;
    timestamp: number;
    conversationId: string;
    authorId: string;
    messageInfo: { text: { content: string } | undefined } | undefined;
  }) => {
    if (!message.messageInfo) return;
    if (!message.messageInfo.text) return;

    if (message.status >= 200) {
      return {
        id: message.id,
        timestamp: new Date(message.timestamp),
        author: "Announcement",
        text: message.messageInfo.text.content,
        reply: undefined,
        announcement: true,
      };
    }
    return {
      id: message.id,
      timestamp: new Date(message.timestamp),
      author: message.authorId,
      text: message.messageInfo.text.content,
      reply: undefined,
      announcement: false,
    };
  };

  let contact = $state("0");
  let contacts: { id: string; name: string; chat: Message[] }[] = $state([]);
  const contactById = (id: string) => contacts.find((c) => c.id == id);
  const addMessage = (conversation: string, message: Message) => {
    const index = contacts.findIndex((c) => c.id == conversation);
    if (index < 0) return;
    if (!contacts[index].chat.some((m) => m.id == message.id))
      contacts[index].chat = [...contacts[index].chat, message];
  };

  let link: Link | undefined = $state();
  const setLink = async (l: Link) => {
    link = l;
    storage![DATA_PATH] = await valueToDevalueAsync(l);
  };
  const deleteLink = () => {
    link = undefined;
    delete storage![DATA_PATH];
    requestClose();
  };

  type Listener =
    | {
        run: (payload: ReturnType<typeof InMessageListMessages>) => void;
        type: ActionType.LIST_MESSAGES;
        id?: string;
      }
    | {
        run: (payload: ReturnType<typeof InMessageListConversations>) => void;
        type: ActionType.LIST_CONVERSATIONS;
        id?: string;
      }
    | {
        run: (payload: ReturnType<typeof InMessageUpdates>) => void;
        type: ActionType.GET_UPDATES;
        id?: string;
      };
  let connection:
    | {
        controller: AbortController;
        me: string;
        listeners: Listener[];
        encrypt: (data: Uint8Array) => Promise<Uint8Array>;
      }
    | undefined = $state();
  const callRefresh = async () => {
    if (!link) throw new Error("No link");

    const id = crypto.randomUUID();
    const timestamp = Date.now() * 1000;
    const signInput = new TextEncoder().encode(`${id}:${timestamp}`);
    const rs = await crypto.subtle.sign(
      { name: "ECDSA", hash: { name: "SHA-256" } },
      link.ecdsaKey,
      signInput,
    );

    let r = new Uint8Array(rs.slice(0, 32));
    let s = new Uint8Array(rs.slice(32, 64));

    if (r[0] & 0x80) {
      r = new Uint8Array([0, ...r]);
    }
    if (s[0] & 0x80) {
      s = new Uint8Array([0, ...s]);
    }

    const lenR = r.length;
    const lenS = s.length;

    const asn1Sig = new Uint8Array([0x30, 4 + lenR + lenS, 0x02, lenR, ...r, 0x02, lenS, ...s]);

    try {
      const { newKey, expiry } = await refresh(id, timestamp, asn1Sig, link.authKey, link.browser);
      setLink({ ...link, authKey: newKey, expiry });
    } catch {
      deleteLink();
    }
  };
  const callConnect = async () => {
    if (!link) throw new Error("No link");

    if (Date.now() > link.expiry) {
      await callRefresh();
    }

    execute(ActionType.GET_UPDATES, new Uint8Array(0), link.mobile, link.authKey);
    execute(ActionType.LIST_CONVERSATIONS, new Uint8Array(0), link.mobile, link.authKey);

    //// Defining "connection"
    const { aesKey, hmacKey, authKey } = link;
    const controller = new AbortController();
    connection = {
      controller,
      me: "",
      listeners: [
        {
          run: ({ settings }) => {
            if (settings) {
              connection!.me = settings.simCard.participant.id;
            }
          },
          type: ActionType.GET_UPDATES,
        },
        {
          run: ({ messages }: ReturnType<typeof InMessageUpdates>) => {
            for (const m of messages) {
              const converted = convertGMessage(m);
              if (converted) {
                addMessage(m.conversationId, converted);
              }
            }
          },
          type: ActionType.GET_UPDATES,
        },
        {
          run: (data) => {
            contacts = data.map(({ conversationID, name }) => ({
              id: conversationID,
              name: name,
              chat: [],
            }));
          },
          type: ActionType.LIST_CONVERSATIONS,
        },
      ],
      async encrypt(data: Uint8Array) {
        const iv = crypto.getRandomValues(new Uint8Array(16));
        const encryptedData = new Uint8Array(
          await crypto.subtle.encrypt({ name: "AES-CTR", counter: iv, length: 64 }, aesKey, data),
        );
        const encryptedDataWithIV = new Uint8Array(encryptedData.byteLength + iv.length);
        encryptedDataWithIV.set(encryptedData);
        encryptedDataWithIV.set(iv, encryptedData.byteLength);

        const hmac = new Uint8Array(await crypto.subtle.sign("HMAC", hmacKey, encryptedDataWithIV));

        const finalData = new Uint8Array(encryptedDataWithIV.length + hmac.length);
        finalData.set(encryptedDataWithIV);
        finalData.set(hmac, encryptedDataWithIV.length);

        return finalData;
      },
    };

    //// Actually connecting
    connect(authKey, controller, {
      pair: async ({ unpaired }) => {
        if (unpaired) {
          deleteLink();
        }
      },
      data: async (body, iv, { id, requestId, action }) => {
        const shortId = `(${id.slice(0, 4)})`;
        console.debug(`RX ${shortId}:`, body);
        const decryptedData = new Uint8Array(
          await crypto.subtle.decrypt({ name: "AES-CTR", counter: iv, length: 64 }, aesKey, body),
        );
        let handled = false;
        try {
          if (action == ActionType.GET_UPDATES) {
            const parsed = InMessageUpdates(decryptedData);
            if (parsed.conversations.length || parsed.messages.length || parsed.settings) {
              console.debug(`RX ${shortId} updates =`, parsed);
              for (const listener of connection!.listeners) {
                if (listener.type != ActionType.GET_UPDATES) continue;
                if (listener.id && listener.id != requestId) continue;
                listener.run(parsed);
              }
            } else {
              console.debug(`RX ${shortId} updates weird`, parsed);
            }
            handled = true;
          }

          if (action == ActionType.LIST_CONVERSATIONS) {
            const parsed = InMessageListConversations(decryptedData);
            console.debug(`RX ${shortId} conversations =`, parsed);
            for (const listener of connection!.listeners) {
              if (listener.type != ActionType.LIST_CONVERSATIONS) continue;
              if (listener.id && listener.id != requestId) continue;
              listener.run(parsed);
            }
            handled = true;
          }

          if (action == ActionType.LIST_MESSAGES) {
            const parsed = InMessageListMessages(decryptedData);
            console.debug(`RX ${shortId} messages =`, parsed);
            for (const listener of connection!.listeners) {
              if (listener.type != ActionType.LIST_MESSAGES) continue;
              if (listener.id && listener.id != requestId) continue;
              listener.run(parsed);
            }
            handled = true;
          }
        } catch (e) {
          console.error(e);
        }
        if (!handled) {
          console.log(`RX ${shortId} decrypted =`, intarrToB64(decryptedData), "type", action);
        }
      },
    });
  };

  const storage = getStorage();

  $effect(() => {
    if (!storage.ready) return;
    if (!(DATA_PATH in storage)) {
      goto("/chat/messages/link");
      return;
    }

    devalueToValueAsync<Link>(storage[DATA_PATH]).then((l) => (link = l));
  });
  $effect(() => {
    if (!link) return;

    untrack(callConnect);

    return () => {
      if (connection) {
        connection.controller.abort();
      }
    };
  });

  //// These functions connect with Google Messages
  const loadMessages = async (contact: string) => {
    const id = crypto.randomUUID();
    execute(
      ActionType.LIST_MESSAGES,
      await connection!.encrypt(
        OutExecuteListMessages({
          conversationId: contact,
        }),
      ),
      link!.mobile,
      link!.authKey,
      id,
    );

    const listener = {
      run: ({ messages }: ReturnType<typeof InMessageListMessages>) => {
        for (const m of messages) {
          const converted = convertGMessage(m);
          if (!converted) continue;
          addMessage(contact, converted);
        }
      },
      id,
      type: ActionType.LIST_MESSAGES,
    } as const;
    connection!.listeners.push(listener);
  };
  $effect(() => {
    if (connection && contact) {
      loadMessages(contact);
    }
  });
  const submit = async (text: string) => {
    const conversationId = contact;

    const payload = {
      conversationId,
      content: {
        text,
      },
    };

    const id = crypto.randomUUID();
    execute(
      ActionType.SEND_MESSAGE,
      await connection!.encrypt(OutExecuteMessage(payload)),

      link!.mobile,
      link!.authKey,
      id,
    );

    const listener = {
      run: ({ messages }: ReturnType<typeof InMessageUpdates>) => {
        const relevantMessage = messages.find((m) => m.conversationId == conversationId);
        if (!relevantMessage) return;

        connection!.listeners = connection!.listeners.filter((l) => l != listener);

        const id = relevantMessage.id;
        const timestamp = new Date(relevantMessage.timestamp);
        addMessage(conversationId, {
          id,
          timestamp,
          author: connection!.me,
          text,
          reply: undefined,
          announcement: false,
        });
      },
      type: ActionType.GET_UPDATES,
    } as const;
    connection!.listeners.push(listener);
  };
</script>

<MessagesTemplate
  hasAuthors={false}
  location={contactById(contact)?.name || ""}
  messages={contactById(contact)?.chat}
  me={connection ? connection.me : ""}
>
  {#snippet menu()}
    <a href="/chat/discord">
      <Layer />
      Portal to Discord
    </a>
    {#each contacts as { id, name } (id)}
      {#if contact != id}
        <button
          onclick={() => {
            contact = id;
          }}
        >
          <Layer />
          {name}
        </button>
      {/if}
    {/each}
  {/snippet}
  {#snippet box()}
    <BoxFloating {submit} />
  {/snippet}
</MessagesTemplate>
