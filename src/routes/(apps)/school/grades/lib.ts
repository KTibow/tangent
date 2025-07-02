export type Assignment = {
  earned: number;
  possible: number;
  name: string;
  date?: string;
  missing: boolean;
  category: string;
};
export type FullPeriod = {
  period: number;
  title: string;
  assignments: Assignment[];
  futureAssignments: {
    points: number;
    category: string;
    name: string;
  }[];
  failedAssignments?: { name: string }[];
  categories?: Record<
    string,
    {
      earned: number;
      possible: number;
      weight: number;
    }
  >;
  reportedGrade?: number;
  reportedCategories?: Record<
    string,
    {
      earned: number;
      possible: number;
      weight: number;
    }
  >;
  _original?: any;
};
export const getPoints = (assignments: { earned: number; possible: number }[]) => {
  let earned = 0;
  let possible = 0;
  for (const { earned: e, possible: p } of assignments) {
    earned += e;
    possible += p;
  }

  return { earned, possible };
};
export const recalculateGrade = (period: {
  assignments: { earned: number; possible: number; category: string }[];
  categories?: Record<
    string,
    {
      earned: number;
      possible: number;
      weight: number;
    }
  >;
}) => {
  if (period.categories) {
    let percent = 0;
    for (const category of Object.values(period.categories)) {
      percent += (category.earned / category.possible) * category.weight * 100;
    }

    return percent;
  }

  const { earned, possible } = getPoints(period.assignments);
  return (earned / possible) * 100;
};
export const roundTo = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;
export const calculateLetter = (grade: number) => {
  if (grade < 60) return "F";
  if (grade < 67) return "D";
  if (grade < 70) return "D+";
  if (grade < 73) return "C-";
  if (grade < 77) return "C";
  if (grade < 80) return "C+";
  if (grade < 83) return "B-";
  if (grade < 87) return "B";
  if (grade < 90) return "B+";
  if (grade < 93) return "A-";
  return "A";
};
export const calculateExtraCredit = (extra: number) => {
  if (extra >= 50) return "rgb(var(--m3-scheme-primary))";
  return `color-mix(in srgb-linear, rgb(var(--m3-scheme-primary)) ${
    extra * 2
  }%, rgb(var(--m3-scheme-on-background)) ${(50 - extra) * 2}%)`;
};
