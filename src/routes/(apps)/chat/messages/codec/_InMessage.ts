import Pbf from "pbf-esm";
import InMessageInfo from "./_InMessageInfo";

type Output = {
  id: string;
  status: number;
  timestamp: number;
  conversationId: string;
  authorId: string;
  messageInfo: ReturnType<typeof InMessageInfo>;
};
export default (pbf: Pbf, end: number) => {
  return pbf.readFields<Output>(
    (tag, obj) => {
      if (tag == 1) obj.id = pbf.readString();
      if (tag == 4) {
        pbf.readFields(
          (tag) => tag == 2 && (obj.status = pbf.readVarint()),
          undefined,
          pbf.readVarint() + pbf.pos,
        );
      }
      if (tag == 5) obj.timestamp = pbf.readVarint() / 1000;
      if (tag == 7) obj.conversationId = pbf.readString();
      if (tag == 9) obj.authorId = pbf.readString();
      if (tag == 10) {
        obj.messageInfo = InMessageInfo(pbf, pbf.readVarint() + pbf.pos);
      }
    },
    {} as Output,
    end,
  );
};
