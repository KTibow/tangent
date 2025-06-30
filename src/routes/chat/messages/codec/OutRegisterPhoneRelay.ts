import Pbf from "pbf-esm";
import AuthMessage from "./_AuthMessage";

type BrowserDetailsData = {
  userAgent: string;
  browserType: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  os: string;
  deviceType: 0 | 1 | 2 | 3;
};
type DataData = { ecdsaKeys: ECDSAKeysData };
type ECDSAKeysData = { key: Uint8Array };

export default (obj: { data: DataData }) => {
  const pbf = new Pbf();
  pbf.writeMessage(1, AuthMessage, {
    requestId: crypto.randomUUID(),
    network: "Bugle",
    configVersion: { year: 2024, month: 5, day: 9, v1: 4, v2: 6 },
  });
  pbf.writeMessage(3, BrowserDetails, {
    userAgent: `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36`,
    browserType: 2,
    os: "Linux",
    deviceType: 1,
  });
  pbf.writeMessage(4, Data, obj.data);
  return pbf.finish();
};

const BrowserDetails = (obj: BrowserDetailsData, pbf: Pbf) => {
  pbf.writeStringField(1, obj.userAgent);
  pbf.writeVarintField(2, obj.browserType);
  pbf.writeStringField(3, obj.os);
  pbf.writeVarintField(6, obj.deviceType);
};

const Data = (obj: DataData, pbf: Pbf) => {
  pbf.writeMessage(6, ECDSAKeys, obj.ecdsaKeys);
};
const ECDSAKeys = (obj: ECDSAKeysData, pbf: Pbf) => {
  pbf.writeVarintField(1, 2);
  pbf.writeBytesField(2, obj.key);
};
