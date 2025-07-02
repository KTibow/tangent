import { writable } from "svelte/store";
import { devalueToValue, valueToDevalue } from "./data-conversion";
import { getStorage } from "./sdk/storage";

type Loader<T> = () => Promise<T>;

export const track = <T>({
  initialData = undefined,
  initialStale = true,
  expireAfter = 1000 * 60 * 60 * 12,
  loader,
}: {
  initialData?: T;
  initialStale?: boolean;
  expireAfter?: number;
  loader: Loader<T>;
}) => {
  const data = {
    data: initialData,
    dataAsOf: initialStale ? 0 : Date.now(),
    expireAfter,
    loading: false,
    errors: [] as number[],
    async run() {
      if (data.loading) return;
      if (Date.now() - data.dataAsOf < data.expireAfter) return;
      if (data.errors.length >= 4 && Date.now() - data.errors.at(-1)! < 2000) {
        return;
      }
      if (data.errors.length >= 6 && Date.now() - data.errors.at(-1)! < 10000) {
        return;
      }
      if (data.errors.length >= 8 && Date.now() - data.errors.at(-1)! < 60000) {
        return;
      }

      data.loading = true;
      store.set(data);
      try {
        const result = loader();
        const process = (update: T) => {
          data.data = update;
          data.dataAsOf = Date.now();
          data.errors = [];
          store.set(data);
        };

        process(await result);
      } catch (e) {
        console.error("while updating", e);
        data.errors.push(Date.now());
      } finally {
        data.loading = false;
        store.set(data);
      }
    },
  };
  const store = writable<typeof data>();
  store.set(data);
  return store;
};
export const trackCached = <T>({
  id,
  ...opts
}: {
  id: string;
  initialData?: T;
  initialStale?: boolean;
  expireAfter?: number;
  loader: Loader<T>;
}) => {
  const storage = getStorage();

  const initialData = storage[`.cache/${id}.devalue`];

  const result = track<T>({
    initialData: initialData ? devalueToValue(initialData) : undefined,
    ...opts,
  });
  result.subscribe((data) => {
    if (data.data) storage[`.cache/${id}.devalue`] = valueToDevalue(data.data);
  });
  return result;
};
