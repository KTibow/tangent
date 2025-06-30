import Pbf from "pbf-esm";
import ConversationEvent from "./_ConversationEvent";

type Output = {
  conversation: ReturnType<typeof ConversationEvent>;
};
export default (buffer: Uint8Array) => {
  const pbf = new Pbf(buffer);

  return pbf.readFields<Output>((tag, obj) => {
    if (tag == 2) {
      obj.conversation = ConversationEvent(pbf, pbf.readVarint() + pbf.pos);
    }
  }, {} as Output);
};
