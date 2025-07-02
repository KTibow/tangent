import Pbf from "pbf-esm";

type MessageContent = {
  content: string;
};
type Output = {
  text: MessageContent | undefined;
};
export default (pbf: Pbf, end: number) => {
  return pbf.readFields<Output>(
    (tag, obj) => {
      if (tag == 2) obj.text = MessageContent(pbf, pbf.readVarint() + pbf.pos);
    },
    {} as Output,
    end,
  );
};
const MessageContent = (pbf: Pbf, end: number) => {
  return pbf.readFields<MessageContent>(
    (tag, obj) => {
      if (tag == 1) obj.content = pbf.readString();
    },
    {} as MessageContent,
    end,
  );
};
