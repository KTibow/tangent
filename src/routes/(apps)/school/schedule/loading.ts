import { iterating } from "$lib/utils-xml";

export const studentvueToSchedule = ({ StudentClassSchedule }: any) => {
  const classList = iterating(StudentClassSchedule.ClassLists?.ClassListing);
  const todaySchedule = iterating(
    StudentClassSchedule.TodayScheduleInfoData?.SchoolInfos?.SchoolInfo?.Classes?.ClassInfo,
  );

  const periods = classList.map((c: any) => {
    const timing = todaySchedule.find((t) => t["@_SectionGU"] == c["@_SectionGU"]);
    const period = c["@_Period"].includes("-") ? +c["@_Period"].split("-")[0] : +c["@_Period"];

    return {
      name: c["@_CourseTitle"],
      period,
      teacher: c["@_Teacher"],
      sectionId: c["@_SectionGU"],
      startTime: (timing && timing["@_StartDate"] && new Date(timing["@_StartDate"])) || null,
      endTime: (timing && timing["@_EndDate"] && new Date(timing["@_EndDate"])) || null,
    };
  });

  return periods;
};
