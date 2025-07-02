import { iterating } from "$lib/utils-xml";
import type { FullPeriod } from "./lib";

const scoreMatcher = /^([0-9.]+) \/ ([0-9.]+)$/;
const emptyValueMatcher = /^([0-9.]+) \/ ?$/;
const emptyScoreMatcher = /^ ?\/ ([0-9.]+)$/;
const futureMatcher = /^([0-9.]+) Points Possible$/;
const studentvueToCourse = (course: any) => {
  const isMissing = (item: { "@_Notes": string }) =>
    item["@_Notes"].includes("Missing") || item["@_Notes"].includes("Missed due date");
  const period = course["@_Period"].includes("-")
    ? +course["@_Period"].split("-")[0]
    : +course["@_Period"];
  const title = course["@_Title"];
  const mark = course.Marks.Mark;

  if (!mark.Assignments) return undefined;

  const assignments = [];
  const futureAssignments = [];
  const failedAssignments = [];
  const reportedGrade = mark["@_CalculatedScoreRaw"]
    ? parseFloat(mark["@_CalculatedScoreRaw"])
    : undefined;

  const assignmentsOriginal = iterating(mark.Assignments.Assignment);
  const needsNote = assignmentsOriginal.some(isMissing);

  for (const item of assignmentsOriginal) {
    const perhapsIrrelevant = item["@_Notes"].includes("(Not For Grading)");
    if (perhapsIrrelevant) continue;

    const name = item["@_Measure"].replace("&amp;", "&");
    const likelyExtra =
      name.toLowerCase().includes("bonus") || name.toLowerCase().includes("extra");
    const m1 = item["@_Points"].match(scoreMatcher);
    const m2 = item["@_Points"].match(futureMatcher);
    const m3 = item["@_Points"].match(emptyScoreMatcher);
    const m4 = item["@_Points"].match(emptyValueMatcher);
    if (m1) {
      const perhapsMissing = needsNote ? isMissing(item) : true;
      const appearsMissing = Math.abs(0.4 * +m1[2] - +m1[1]) < 0.01;
      assignments.push({
        earned: +m1[1],
        possible: +m1[2],
        name,
        date: item["@_Date"],
        missing: perhapsMissing && appearsMissing,
        category: item["@_Type"],
      });
    } else if (m2) {
      futureAssignments.push({
        points: +m2[1],
        category: item["@_Type"],
        name: item["@_Measure"].replace("&amp;", "&"),
      });
    } else if (title.includes("GERMAN") && m3) {
      assignments.push({
        earned: 0,
        possible: +m3[1],
        name,
        missing: true,
        category: item["@_Type"],
      });
    } else if (likelyExtra && m4) {
      assignments.push({
        earned: +m4[1],
        possible: 0,
        name,
        missing: false,
        category: item["@_Type"],
      });
    } else {
      failedAssignments.push({ name, item });
    }
  }

  let categories: FullPeriod["categories"] = {};
  let reportedCategories: FullPeriod["reportedCategories"] = {};
  if (mark.GradeCalculationSummary?.AssignmentGradeCalc) {
    const calcs = iterating(mark.GradeCalculationSummary.AssignmentGradeCalc);
    const assignmentsGrouped = Object.groupBy(assignments, (a) => a.category);

    for (const item of calcs.sort((a: Record<string, any>, b: Record<string, any>) => {
      const aWeight = +a["@_Weight"].slice(0, -1);
      const bWeight = +b["@_Weight"].slice(0, -1);
      return bWeight - aWeight;
    })) {
      const name = item["@_Type"];
      if (name == "TOTAL") continue;

      const reportedEarned = +item["@_Points"].replace(/,/g, "");
      const reportedPossible = +item["@_PointsPossible"].replace(/,/g, "");
      if (reportedPossible == 0) continue;

      let earned = (assignmentsGrouped[name] || []).reduce((acc, { earned }) => acc + earned, 0);
      let possible = (assignmentsGrouped[name] || []).reduce(
        (acc, { possible }) => acc + possible,
        0,
      );
      const earnedDelta = reportedEarned - earned;
      const possibleDelta = reportedPossible - possible;
      if (earnedDelta >= 0 && possibleDelta >= 0 && !(earnedDelta == 0 && possibleDelta == 0)) {
        assignments.unshift({
          earned: earnedDelta,
          possible: possibleDelta,
          name: "Ghost assignments",
          missing: false,
          category: name,
        });
        earned += earnedDelta;
        possible += possibleDelta;
      }
      const weight = +item["@_Weight"].slice(0, -1);

      categories[name] = {
        earned,
        possible,
        weight,
      };
      reportedCategories[name] = {
        earned: reportedEarned,
        possible: reportedPossible,
        weight,
      };
    }
  }

  const totalWeight = Object.values(categories).reduce((a, b) => a + b.weight, 0);
  if (totalWeight) {
    for (const category of Object.values(categories)) {
      category.weight /= totalWeight;
    }
  } else {
    categories = undefined;
    reportedCategories = undefined;
  }

  return {
    period,
    title,
    assignments,
    futureAssignments,
    failedAssignments,
    categories,
    reportedGrade,
    reportedCategories,
  };
};
export const studentvueToGrades = (gradebook: any) => {
  const periods: FullPeriod[] = [];

  for (const course of iterating(gradebook?.Gradebook?.Courses?.Course)) {
    const result = studentvueToCourse(course);
    if (result) {
      periods.push({ ...result, _original: course });
    }
  }

  return periods;
};
