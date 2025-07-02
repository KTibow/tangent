import districts from "school-districts";
import { AUTH_PATH, VERIFICATION_PATH } from "$lib/sdk/storage";

const isAuthorized = (storage: Record<string, string>) => {
  const auth = storage[AUTH_PATH];
  return Boolean(auth);
};
const canConnect = (storage: Record<string, string>) => {
  const auth = storage[AUTH_PATH];
  const domain = auth && JSON.parse(auth).email.split("@")[1];
  return Boolean(domain && domain in districts);
};
const isVerified = (storage: Record<string, string>) => {
  const jwt = storage[VERIFICATION_PATH];
  return Boolean(jwt);
};
export const require = (
  storage: Record<string, string>,
  requirement: "authorization" | "connection" | "verification",
) => {
  if (requirement == "authorization") {
    return isAuthorized(storage);
  }
  if (requirement == "connection") {
    return canConnect(storage);
  }
  if (requirement == "verification") {
    return isVerified(storage);
  }
  throw new Error(`Unknown requirement: ${requirement}`);
};
