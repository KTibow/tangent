import Pbf from "pbf-esm";

export type AuthMessageData = {
  requestId: string;
  network: string;
  configVersion: ConfigVersionData;
};
type ConfigVersionData = {
  year: number;
  month: number;
  day: number;
  v1: number;
  v2: number;
};

export default (obj: AuthMessageData, pbf: Pbf) => {
  pbf.writeStringField(1, obj.requestId);
  pbf.writeStringField(3, obj.network);
  pbf.writeMessage(7, ConfigVersion, obj.configVersion);
};
const ConfigVersion = (obj: ConfigVersionData, pbf: Pbf) => {
  pbf.writeVarintField(3, obj.year);
  pbf.writeVarintField(4, obj.month);
  pbf.writeVarintField(5, obj.day);
  pbf.writeVarintField(7, obj.v1);
  pbf.writeVarintField(9, obj.v2);
};
