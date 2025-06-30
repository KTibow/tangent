import type Pbf from "pbf-esm";

type Output = {
  userId: number;
  sourceId: string;
  network: string;
};
export default (pbf: Pbf, end: number) => {
  return pbf.readFields<Output>(
    (tag, obj) => {
      if (tag == 1) obj.userId = pbf.readVarint();
      if (tag == 2) obj.sourceId = pbf.readString();
      if (tag == 3) obj.network = pbf.readString();
    },
    {} as Output,
    end,
  );
};
