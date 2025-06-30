import Pbf from "pbf-esm";
import Device from "./_Device";

type Output = {
  paired: Paired;
  unpaired: Unpaired;
};
type AuthKey = { key: Uint8Array; TTL: number };
type Paired = {
  mobile: { userId: number; sourceId: string; network: string };
  authKey: AuthKey;
  browser: { userId: number; sourceId: string; network: string };
};
type Unpaired = {
  revokedDevice: { userId: number; sourceId: string; network: string };
};
export default (buffer: Uint8Array) => {
  const pbf = new Pbf(buffer);
  return pbf.readFields<Output>((tag, obj) => {
    if (tag == 4) {
      obj.paired = paired(pbf, pbf.readVarint() + pbf.pos);
    }
    if (tag == 5) {
      obj.unpaired = unpaired(pbf, pbf.readVarint() + pbf.pos);
    }
  }, {} as Output);
};

const paired = (pbf: Pbf, end: number) => {
  return pbf.readFields<Paired>(
    (tag, obj) => {
      if (tag == 1) obj.mobile = Device(pbf, pbf.readVarint() + pbf.pos);
      if (tag == 2) {
        obj.authKey = pbf.readFields<AuthKey>(
          (tag, obj) => {
            if (tag == 1) obj.key = pbf.readBytes();
            if (tag == 2) obj.TTL = pbf.readVarint64();
          },
          {} as AuthKey,
          pbf.readVarint() + pbf.pos,
        );
      }
      if (tag == 3) obj.browser = Device(pbf, pbf.readVarint() + pbf.pos);
    },
    {} as Paired,
    end,
  );
};

const unpaired = (pbf: Pbf, end: number) => {
  return pbf.readFields<Unpaired>(
    (tag, obj) => {
      if (tag == 1) obj.revokedDevice = Device(pbf, pbf.readVarint() + pbf.pos);
    },
    {} as Unpaired,
    end,
  );
};
