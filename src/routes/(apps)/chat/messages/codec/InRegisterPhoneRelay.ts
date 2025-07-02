import Pbf from "pbf-esm";

type AuthKey = { key: Uint8Array; TTL: number };
type Output = {
  pairingKey: Uint8Array;
  authKey: AuthKey;
};
export default (buffer: Uint8Array) => {
  const pbf = new Pbf(buffer);
  return pbf.readFields<Output>((tag: number, obj: Output) => {
    if (tag == 3) {
      obj.pairingKey = pbf.readBytes();
    }
    if (tag == 5) {
      obj.authKey = pbf.readFields<AuthKey>(
        (tag: number, obj: AuthKey) => {
          if (tag == 1) obj.key = pbf.readBytes();
          if (tag == 2) obj.TTL = pbf.readVarint64();
        },
        {} as AuthKey,
        pbf.readVarint() + pbf.pos,
      );
    }
  }, {} as Output);
};
