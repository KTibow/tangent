import { XMLParser } from "fast-xml-parser";
import districts from "school-districts";

const build = (object: Record<string, string>) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(object)) {
    params.set(key, value);
  }
  return params;
};
const parser = new XMLParser({ ignoreAttributes: false });

export const convertAuth = (auth: string | undefined) => {
  if (!auth) throw new Error("Sign in first.");

  const { email, password } = JSON.parse(auth);
  const [id, domain] = email.split("@");

  if (domain == "example.com") return ["studentvue.example.com", id, password] as const;

  const district = districts[domain];
  if (!district) throw new Error(`Send feedback: request support for ${domain}.`);
  const host = district.apps.find((x) => x.app == "StudentVue")?.host;
  if (!host) throw new Error(`This needs StudentVue, and ${domain} doesn't have StudentVue.`);

  return [host, id, password] as const;
};
export default async (
  host: string,
  userID: string,
  password: string,
  name: string,
  params: Record<string, string> = {},
) => {
  const request = build({
    userID,
    password,
    skipLoginLog: "true",
    parent: "false",
    webServiceHandleName: "PXPWebServices",
    methodName: name,
    paramStr: `<Parms>${Object.keys(params)
      .map((key) => `<${key}>${params[key]}</${key}>`)
      .join("")}</Parms>`,
  });

  if (host == "studentvue.example.com") {
    // Demo data, you probably want to collapse this section
    if (name == "Gradebook") {
      return {
        Gradebook: {
          Courses: {
            Course: [
              {
                "@_Period": "1",
                "@_Title": "Algebra II",
                Marks: {
                  Mark: {
                    "@_CalculatedScoreRaw": "90.4",
                    Assignments: {
                      Assignment: [
                        {
                          "@_Notes": "",
                          "@_Measure": "HW 1 - Linear Equations",
                          "@_Points": "10 / 10",
                          "@_Type": "Homework",
                          "@_Date": "2025-09-01",
                        },
                        {
                          "@_Notes": "",
                          "@_Measure": "HW 2 - Factoring",
                          "@_Points": "9 / 10",
                          "@_Type": "Homework",
                          "@_Date": "2025-09-03",
                        },
                        {
                          "@_Notes": "",
                          "@_Measure": "HW 3 - Quadratics",
                          "@_Points": "10 / 10",
                          "@_Type": "Homework",
                          "@_Date": "2025-09-05",
                        },
                        {
                          "@_Notes": "",
                          "@_Measure": "HW 4 - Polynomials",
                          "@_Points": "8 / 10",
                          "@_Type": "Homework",
                          "@_Date": "2025-09-08",
                        },
                        {
                          "@_Notes": "",
                          "@_Measure": "HW 5 - Rational Expressions",
                          "@_Points": "10 / 10",
                          "@_Type": "Homework",
                          "@_Date": "2025-09-10",
                        },
                        {
                          "@_Notes": "",
                          "@_Measure": "Unit 1 Test",
                          "@_Points": "43 / 50",
                          "@_Type": "Tests",
                          "@_Date": "2025-09-12",
                        },
                        {
                          "@_Notes": "",
                          "@_Measure": "Unit 2 Test",
                          "@_Points": "45 / 50",
                          "@_Type": "Tests",
                          "@_Date": "2025-09-20",
                        },
                        {
                          "@_Notes": "(Not For Grading)",
                          "@_Measure": "Practice - Optional",
                          "@_Points": "0 / 0",
                          "@_Type": "Homework",
                          "@_Date": "2025-09-21",
                        },
                        {
                          "@_Notes": "",
                          "@_Measure": "Chapter 3 Test",
                          "@_Points": "50 Points Possible",
                          "@_Type": "Tests",
                        },
                        {
                          "@_Notes": "",
                          "@_Measure": "HW 6 - Exponent Rules",
                          "@_Points": "10 Points Possible",
                          "@_Type": "Homework",
                        },
                      ],
                    },
                    GradeCalculationSummary: {
                      AssignmentGradeCalc: [
                        {
                          "@_Type": "Homework",
                          "@_Weight": "40%",
                          "@_Points": "47",
                          "@_PointsPossible": "50",
                        },
                        {
                          "@_Type": "Tests",
                          "@_Weight": "60%",
                          "@_Points": "88",
                          "@_PointsPossible": "100",
                        },
                        {
                          "@_Type": "TOTAL",
                          "@_Weight": "100%",
                          "@_Points": "135",
                          "@_PointsPossible": "150",
                        },
                      ],
                    },
                  },
                },
              },
              {
                "@_Period": "2",
                "@_Title": "English 10",
                Marks: {
                  Mark: {
                    "@_CalculatedScoreRaw": "89.8",
                    Assignments: {
                      Assignment: [
                        {
                          "@_Notes": "",
                          "@_Measure": "Essay: Of Mice and Men",
                          "@_Points": "45 / 50",
                          "@_Type": "Essays",
                          "@_Date": "2025-09-02",
                        },
                        {
                          "@_Notes": "",
                          "@_Measure": "Essay: Rhetorical Analysis",
                          "@_Points": "48 / 50",
                          "@_Type": "Essays",
                          "@_Date": "2025-09-11",
                        },
                        {
                          "@_Notes": "",
                          "@_Measure": "Quiz 1",
                          "@_Points": "18 / 20",
                          "@_Type": "Quizzes",
                          "@_Date": "2025-09-04",
                        },
                        {
                          "@_Notes": "",
                          "@_Measure": "Quiz 2",
                          "@_Points": "20 / 20",
                          "@_Type": "Quizzes",
                          "@_Date": "2025-09-09",
                        },
                        {
                          "@_Notes": "",
                          "@_Measure": "Quiz 3",
                          "@_Points": "14 / 20",
                          "@_Type": "Quizzes",
                          "@_Date": "2025-09-16",
                        },
                        {
                          "@_Notes": "",
                          "@_Measure": "Essay: Research Draft",
                          "@_Points": "50 Points Possible",
                          "@_Type": "Essays",
                        },
                      ],
                    },
                    GradeCalculationSummary: {
                      AssignmentGradeCalc: [
                        {
                          "@_Type": "Essays",
                          "@_Weight": "50%",
                          "@_Points": "93",
                          "@_PointsPossible": "100",
                        },
                        {
                          "@_Type": "Quizzes",
                          "@_Weight": "50%",
                          "@_Points": "52",
                          "@_PointsPossible": "60",
                        },
                        {
                          "@_Type": "TOTAL",
                          "@_Weight": "100%",
                          "@_Points": "145",
                          "@_PointsPossible": "160",
                        },
                      ],
                    },
                  },
                },
              },
              {
                "@_Period": "3",
                "@_Title": "Physics",
                Marks: {
                  Mark: {
                    "@_CalculatedScoreRaw": "84.8",
                    Assignments: {
                      Assignment: [
                        {
                          "@_Notes": "",
                          "@_Measure": "Lab: Motion",
                          "@_Points": "25 / 25",
                          "@_Type": "Labs",
                          "@_Date": "2025-09-01",
                        },
                        {
                          "@_Notes": "",
                          "@_Measure": "Lab: Energy",
                          "@_Points": "23 / 25",
                          "@_Type": "Labs",
                          "@_Date": "2025-09-07",
                        },
                        {
                          "@_Notes": "",
                          "@_Measure": "Exam 1",
                          "@_Points": "80 / 100",
                          "@_Type": "Exams",
                          "@_Date": "2025-09-15",
                        },
                        {
                          "@_Notes": "",
                          "@_Measure": "Exam 2",
                          "@_Points": "100 Points Possible",
                          "@_Type": "Exams",
                        },
                      ],
                    },
                    GradeCalculationSummary: {
                      AssignmentGradeCalc: [
                        {
                          "@_Type": "Labs",
                          "@_Weight": "30%",
                          "@_Points": "48",
                          "@_PointsPossible": "50",
                        },
                        {
                          "@_Type": "Exams",
                          "@_Weight": "70%",
                          "@_Points": "80",
                          "@_PointsPossible": "100",
                        },
                        {
                          "@_Type": "TOTAL",
                          "@_Weight": "100%",
                          "@_Points": "128",
                          "@_PointsPossible": "150",
                        },
                      ],
                    },
                  },
                },
              },
              {
                "@_Period": "4",
                "@_Title": "World History",
                Marks: {
                  Mark: {
                    "@_CalculatedScoreRaw": "100",
                    Assignments: {
                      Assignment: [
                        {
                          "@_Notes": "",
                          "@_Measure": "Project: Ancient Civilizations",
                          "@_Points": "20 / 20",
                          "@_Type": "Projects",
                          "@_Date": "2025-09-06",
                        },
                        {
                          "@_Notes": "",
                          "@_Measure": "Unit Test 1",
                          "@_Points": "50 Points Possible",
                          "@_Type": "Tests",
                        },
                      ],
                    },
                    GradeCalculationSummary: {
                      AssignmentGradeCalc: [
                        {
                          "@_Type": "Projects",
                          "@_Weight": "40%",
                          "@_Points": "20",
                          "@_PointsPossible": "20",
                        },
                        {
                          "@_Type": "Tests",
                          "@_Weight": "60%",
                          "@_Points": "0",
                          "@_PointsPossible": "0",
                        },
                        {
                          "@_Type": "TOTAL",
                          "@_Weight": "100%",
                          "@_Points": "20",
                          "@_PointsPossible": "20",
                        },
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      };
    }
    if (name == "StudentClassList") {
      return {
        StudentClassSchedule: {
          ClassLists: {
            ClassListing: [
              {
                "@_Period": "1",
                "@_CourseTitle": "Algebra II",
                "@_Teacher": "Ms. Smith",
                "@_SectionGU": "SEC-1",
              },
              {
                "@_Period": "2",
                "@_CourseTitle": "English 10",
                "@_Teacher": "Mr. Johnson",
                "@_SectionGU": "SEC-2",
              },
              {
                "@_Period": "3",
                "@_CourseTitle": "Physics",
                "@_Teacher": "Dr. Lee",
                "@_SectionGU": "SEC-3",
              },
              {
                "@_Period": "4",
                "@_CourseTitle": "World History",
                "@_Teacher": "Ms. Patel",
                "@_SectionGU": "SEC-4",
              },
            ],
          },
          TodayScheduleInfoData: {
            SchoolInfos: {
              SchoolInfo: {
                Classes: {
                  ClassInfo: [
                    {
                      "@_SectionGU": "SEC-1",
                      "@_StartDate": "2025-08-28T08:00:00.000Z",
                      "@_EndDate": "2025-08-28T08:55:00.000Z",
                    },
                    {
                      "@_SectionGU": "SEC-2",
                      "@_StartDate": "2025-08-28T09:00:00.000Z",
                      "@_EndDate": "2025-08-28T09:55:00.000Z",
                    },
                    {
                      "@_SectionGU": "SEC-3",
                      "@_StartDate": "2025-08-28T10:00:00.000Z",
                      "@_EndDate": "2025-08-28T10:55:00.000Z",
                    },
                    {
                      "@_SectionGU": "SEC-4",
                      "@_StartDate": "2025-08-28T11:00:00.000Z",
                      "@_EndDate": "2025-08-28T11:55:00.000Z",
                    },
                  ],
                },
              },
            },
          },
        },
      };
    }
  }

  const response = await fetch(
    `https://${host}/Service/PXPCommunication.asmx/ProcessWebServiceRequest`,
    {
      method: "POST",
      body: request,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    },
  );
  const dataWrap = await response.text();
  const data = dataWrap
    .split(`<string xmlns="http://edupoint.com/webservices/">`)[1]
    .split("</string>")[0]
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  const xml = parser.parse(data);
  const err = xml.RT_ERROR;
  if (err) {
    if (err["@_ERROR_MESSAGE"].startsWith("Invalid user id or password")) {
      throw new Error("Invalid auth");
    }
    throw new Error("StudentVue error");
  }

  return xml;
};
