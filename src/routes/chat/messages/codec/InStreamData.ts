import Pbf from "pbf-esm";
import type { ActionType } from "./OutExecute";

type Output = {
  requestId: string;
  action: ActionType;
  encryptedData: Uint8Array;
};
export default (buffer: Uint8Array) => {
  const pbf = new Pbf(buffer);

  return pbf.readFields<Output>((tag, obj) => {
    if (tag == 1) obj.requestId = pbf.readString();
    if (tag == 4) obj.action = pbf.readVarint();
    if (tag == 8) obj.encryptedData = pbf.readBytes();
  }, {} as Output);
};
