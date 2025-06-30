import Pbf from "pbf-esm";

export default (obj: { pairingKey: Uint8Array; aesKey: Uint8Array; hmacKey: Uint8Array }) => {
  const pbf = new Pbf();
  pbf.writeBytesField(1, obj.pairingKey);
  pbf.writeBytesField(2, obj.aesKey);
  pbf.writeBytesField(3, obj.hmacKey);
  return pbf.finish();
};
