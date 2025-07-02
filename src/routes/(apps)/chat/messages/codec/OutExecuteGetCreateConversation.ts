import Pbf from "pbf-esm";

type Input = {
  numbers: string[];
};
export default (obj: Input) => {
  const pbf = new Pbf();
  for (const number of obj.numbers) {
    pbf.writeMessage(2, Number, number);
  }
  return pbf.finish();
};
const Number = (obj: string, pbf: Pbf) => {
  pbf.writeVarintField(1, 2);
  pbf.writeStringField(2, obj);
};
