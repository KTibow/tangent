import Pbf from "pbf-esm";

type SIMParticipantData = {
  id: string;
};
type SimCardData = {
  participant: SIMParticipantData;
};
type Output = {
  simCard: SimCardData;
};
export default (pbf: Pbf, end: number) => {
  return pbf.readFields<Output>(
    (tag, obj) => {
      if (tag == 2) obj.simCard = SimCard(pbf, pbf.readVarint() + pbf.pos);
    },
    {} as Output,
    end,
  );
};
const SimCard = (pbf: Pbf, end: number) => {
  return pbf.readFields<SimCardData>(
    (tag, obj) => {
      if (tag == 7) {
        obj.participant = SIMParticipant(pbf, pbf.readVarint() + pbf.pos);
      }
    },
    {} as SimCardData,
    end,
  );
};
const SIMParticipant = (pbf: Pbf, end: number) => {
  return pbf.readFields<SIMParticipantData>(
    (tag, obj) => {
      if (tag == 1) obj.id = pbf.readString();
    },
    {} as SIMParticipantData,
    end,
  );
};
