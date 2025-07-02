import { syncObjects } from "$lib/data-management";
import { send } from "./comms-app";

const data = $state<Record<string, string>>({});
export const syncIn = (input: Record<string, string>) => {
  syncObjects(data, input);
};

export const storage = new Proxy(data, {
  set(target, key: string, value: string) {
    if (!send) return false;

    target[key] = value;
    send({ type: "storage-set", key, value });
    return true;
  },

  deleteProperty(target, key: string) {
    if (!send) return false;

    delete target[key];
    send({ type: "storage-delete", key });
    return true;
  },
});
