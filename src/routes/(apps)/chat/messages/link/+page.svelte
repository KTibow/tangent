<script lang="ts">
  import iconCable from "@ktibow/iconset-material-symbols/cable-rounded";
  import LinkData from "codec/_LinkData";
  import { correction, generate } from "lean-qr";
  import { Button } from "m3-svelte";
  import { goto } from "$app/navigation";
  import Interruption from "$lib/_Interruption.svelte";
  import { intarrToB64, valueToDevalueAsync } from "$lib/data-conversion";
  import { requestClose } from "$lib/sdk/comms-app";
  import { getStorage } from "$lib/sdk/storage";
  import type { Link } from "../../types";
  import { connect, DATA_PATH, register } from "../comms";

  const storage = getStorage();
  let code = $state("");

  const genCode = async () => {
    const keyPair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, [
      "sign",
    ]);
    const publicKey = new Uint8Array(await crypto.subtle.exportKey("spki", keyPair.publicKey));
    const ecdsaKey = keyPair.privateKey;

    const aesKeyRaw = crypto.getRandomValues(new Uint8Array(32));
    const aesKey = await crypto.subtle.importKey(
      "raw",
      new Uint8Array(aesKeyRaw),
      { name: "AES-CTR", length: 256 },
      true,
      ["encrypt", "decrypt"],
    );
    const hmacKeyRaw = crypto.getRandomValues(new Uint8Array(32));
    const hmacKey = await crypto.subtle.importKey(
      "raw",
      new Uint8Array(hmacKeyRaw),
      { name: "HMAC", hash: { name: "SHA-256" } },
      true,
      ["sign"],
    );

    const { pairingKey, authKeyTemp } = await register(publicKey);

    const linkBuf = LinkData({ pairingKey, aesKey: aesKeyRaw, hmacKey: hmacKeyRaw });
    code = `https://support.google.com/messages/?p=web_computer#?c=${intarrToB64(linkBuf)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      requestClose();
      controller.abort();
    }, 10000);

    connect(authKeyTemp, controller, {
      pair: async ({ paired: { mobile, browser, authKey } }) => {
        clearTimeout(timeout);

        const link: Link = {
          aesKey,
          hmacKey,
          ecdsaKey,
          mobile,
          browser,
          authKey: intarrToB64(authKey.key),
          expiry: Date.now() + 1000 * 60 * 60 * 24,
        };
        storage[DATA_PATH] = await valueToDevalueAsync(link);
        goto("/chat/messages");
      },
    });
  };
</script>

{#if code}
  <div class="center">
    <img
      src={generate(code, {
        trailer: 0b0000111100001111,
        minCorrectionLevel: correction.Q,
        maxCorrectionLevel: correction.Q,
        mask: 2,
        minVersion: 18,
      }).toDataURL()}
      alt="Scan this with Google Messages."
    />
    <p>To link Messages, scan this. This'll use end to end encryption.</p>
  </div>
{:else}
  <Interruption icon={iconCable} headline="Link Google Messages">
    In Messages, tap on your profile, go to device pairing, and open the QR code scanner.
    {#snippet buttons()}
      <Button variant="filled" click={genCode}>Continue</Button>
    {/snippet}
  </Interruption>
{/if}

<style>
  .center {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
  }
  img {
    background-color: white;
    image-rendering: pixelated;
    width: 28.25rem;
    border-radius: var(--m3-util-rounding-medium);
    cursor: none;
  }
  p {
    color: rgb(var(--m3-scheme-on-surface-variant));
  }
</style>
