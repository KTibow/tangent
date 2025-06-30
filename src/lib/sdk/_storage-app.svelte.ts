import { send } from "./comms-app";

const data = $state<Record<string, string>>({});
let syncing = false;

export const storage = new Proxy(data, {
  set(target, key: string, value: string) {
    if (!send) return false;

    if (!syncing) {
      target[key] = value;
      send({ type: "storage-set", key, value });
    } else {
      target[key] = value;
    }
    return true;
  },

  deleteProperty(target, key: string) {
    if (!send) return false;

    if (!syncing) {
      delete target[key];
      send({ type: "storage-delete", key });
    } else {
      delete target[key];
    }
    return true;
  },
});
export const handleFullSync = (newStorage: Record<string, string>) => {
  syncing = true;
  for (const key of new Set([...Object.keys(data), ...Object.keys(newStorage)])) {
    const oldVal = data[key];
    const newVal = newStorage[key];
    if (oldVal != newVal) {
      if (newVal == undefined) {
        delete data[key];
      } else {
        data[key] = newVal;
      }
    }
  }
  syncing = false;
};
