import { getContext } from "svelte";

export const getStorage = (): Record<string, string> => {
  return getContext("storage");
};
