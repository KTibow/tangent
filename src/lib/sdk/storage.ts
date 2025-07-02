import { getContext } from "svelte";

export const getStorage = (): Record<string, string> => {
  return getContext("storage");
};
export const STYLE_PATH = ".config/tangent-styles.css";
export const AUTH_PATH = ".config/tangent-auth.json";
