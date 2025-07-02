import Pbf from "pbf-esm";
import InMessage from "./_InMessage";

type Output = {
  messages: ReturnType<typeof InMessage>[];
};
export default (buffer: Uint8Array) => {
  const pbf = new Pbf(buffer);

  return pbf.readFields<Output>(
    (tag, obj) => {
      if (tag == 2) {
        obj.messages.push(InMessage(pbf, pbf.readVarint() + pbf.pos));
      }
    },
    { messages: [] } as Output,
  );
};
