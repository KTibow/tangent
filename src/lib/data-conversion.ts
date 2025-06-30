import { parse, stringify } from "devalue";

export const valueToDevalue = (value: unknown) => stringify(value);
export const devalueToValue = <T = unknown>(devalue: string): T => parse(devalue);

type SerializedKey = [
  "jwk",
  JsonWebKey,
  (
    | AlgorithmIdentifier
    | RsaHashedImportParams
    | EcKeyImportParams
    | HmacImportParams
    | AesKeyAlgorithm
  ),
  boolean,
  KeyUsage[],
];
export const valueToDevalueAsync = async (value: unknown) => {
  // Traverse beforehand
  const jwkMap = new Map<CryptoKey, SerializedKey>();
  const traverse = async (obj: unknown) => {
    if (obj instanceof CryptoKey) {
      jwkMap.set(obj, [
        "jwk",
        await crypto.subtle.exportKey("jwk", obj),
        obj.algorithm,
        true,
        obj.usages,
      ]);
      return;
    }
    if (Array.isArray(obj)) {
      await Promise.all(obj.map(traverse));
    } else if (obj && typeof obj === "object") {
      await Promise.all(Object.values(obj).map(traverse));
    }
  };
  await traverse(value);

  return stringify(value, {
    crypto: (value) => jwkMap.get(value),
  });
};
export const devalueToValueAsync = async <T = unknown>(devalue: string): Promise<T> => {
  // Parse, adding in the promises
  const parsed = parse(devalue, {
    crypto: async (jwk: SerializedKey) => {
      return await crypto.subtle.importKey(...jwk);
    },
  });

  // Remove the promises
  const traverse = async (obj: unknown): Promise<unknown> => {
    if (!obj) return;
    if (typeof obj != "object") return;
    const keys = Object.keys(obj);
    for (const key of keys) {
      const content = (obj as Record<string, unknown>)[key];
      if (content instanceof Promise) {
        (obj as Record<string, unknown>)[key] = await content;
        continue;
      }
      await traverse(content);
    }
  };
  await traverse(parsed);
  return parsed;
};
export const intarrToB64 = (intarr: Uint8Array): string =>
  btoa(intarr.reduce((data, byte) => data + String.fromCharCode(byte), ""));
