import Pbf from "pbf-esm";
import ConversationEvent from "./_ConversationEvent";
import InMessage from "./_InMessage";
import SettingsEvent from "./_SettingsEvent";

type Output = {
  conversations: ReturnType<typeof ConversationEvent>[];
  messages: ReturnType<typeof InMessage>[];
  settings: ReturnType<typeof SettingsEvent> | undefined;
};
export default (buffer: Uint8Array) => {
  const pbf = new Pbf(buffer);

  return pbf.readFields<Output>(
    (tag, obj) => {
      if (tag == 2) {
        pbf.readFields(
          (tag) => {
            if (tag == 2) {
              obj.conversations.push(ConversationEvent(pbf, pbf.readVarint() + pbf.pos));
            }
          },
          undefined,
          pbf.readVarint() + pbf.pos,
        );
      }
      if (tag == 3) {
        pbf.readFields(
          (tag) => {
            if (tag == 2) {
              obj.messages.push(InMessage(pbf, pbf.readVarint() + pbf.pos));
            }
          },
          undefined,
          pbf.readVarint() + pbf.pos,
        );
      }
      if (tag == 5) {
        obj.settings = SettingsEvent(pbf, pbf.readVarint() + pbf.pos);
      }
    },
    { conversations: [], messages: [], settings: undefined } as Output,
  );
};
