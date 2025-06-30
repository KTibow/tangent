import Pbf from "pbf-esm";
import ConversationEvent from "./_ConversationEvent";

type Output = ReturnType<typeof ConversationEvent>[];
export default (buffer: Uint8Array) => {
  const pbf = new Pbf(buffer);

  return pbf.readFields<Output>((tag, obj) => {
    if (tag == 2) {
      obj.push(ConversationEvent(pbf, pbf.readVarint() + pbf.pos));
    }
  }, [] as Output);
};
