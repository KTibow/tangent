import type { FullPeriod } from "./grades/lib";

export type Class = {
  period: number;
  name: string;
  grade?: FullPeriod;
  startTime?: Date;
  endTime?: Date;
};
