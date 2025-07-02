import Pbf from "pbf-esm";

type Input = {
  conversationId: string;
};
export default (obj: Input): Uint8Array => {
  const pbf = new Pbf();
  pbf.writeStringField(2, obj.conversationId);
  return pbf.finish();
};
