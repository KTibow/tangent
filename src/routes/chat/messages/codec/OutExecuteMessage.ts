import Pbf from "pbf-esm";

type Input = {
  conversationId: string;
  content: {
    text: string;
  };
};
export default (obj: Input): Uint8Array => {
  const pbf = new Pbf();
  pbf.writeStringField(2, obj.conversationId);
  pbf.writeMessage(3, MessageData, obj);
  return pbf.finish();
};
const MessageData = (obj: Input, pbf: Pbf) => {
  pbf.writeStringField(7, obj.conversationId);
  pbf.writeMessage(10, MessageInfo, obj.content);
};
const MessageInfo = (obj: { text: string }, pbf: Pbf) => {
  if ("text" in obj) {
    pbf.writeMessage(2, MessageContent, { text: obj.text });
  }
};
const MessageContent = (obj: { text: string }, pbf: Pbf) => {
  pbf.writeStringField(1, obj.text);
};
