export const simplifyClassName = /* @__PURE__ */ (name: string) => {
  name = name.toLowerCase();
  name = name.replace(/^\(std\) - /, "");
  name = name.replace(/ hon$/, "");
  name = name.replace(/\bjourn\b/, "journalism");
  name = name.replace(/\bgeo\b/, "geometry");
  name = name.replace(/\bsci\b/, "science");
  name = name.replace(/\blang arts\b/, "english");

  if (name.includes("computer science")) return "Computer Science";
  if (name.includes("library assistant")) return "Library TA";
  if (name.startsWith("ta ")) return "TA";

  if (name.includes("german")) return "German";
  if (name.includes("japanese")) return "Japanese";
  if (name.includes("spanish")) return "Spanish";
  if (name.includes("french")) return "Fr*nch";

  if (name.includes("band")) return "Music";
  if (name.includes("choir")) return "Choir";
  if (name.includes("digital music")) return "Music";
  if (name.includes("guitar")) return "Music";
  if (name.includes("jazz")) return "Music";
  if (name.includes("orchestra")) return "Music";
  if (name.includes("percussion")) return "Music";
  if (name.includes("wind ensemble")) return "Music";

  if (name.includes("academic lab")) return "Academic Lab";
  if (name.includes("adv prog")) return "Programming";
  if (name.includes("advisory")) return "Advisory";
  if (name.includes("aerospace")) return "Aerospace";
  if (name.includes("animation")) return "Animation";
  if (
    name.includes("algebra") ||
    name.includes("calc") ||
    name.includes("geometry") ||
    /\bmath \d\b/.test(name)
  ) {
    return "Math";
  }
  if (name.includes("architecture")) return "Architecture";
  if (name.includes("art")) return "Art";
  if (name.includes("asb")) return "ASB";
  if (name.includes("assistant")) return "TA";
  if (
    name.includes("biology") ||
    name.includes("biotechnology") ||
    name.includes("chemistry") ||
    name.includes("science")
  ) {
    return "Science";
  }
  if (name.includes("ceramics")) return "Ceramics";
  if (name.includes("civics")) return "Civics";
  if (name.includes("comp aided design") || name.includes("engineer design")) {
    return "CAD";
  }
  if (name.includes("drama")) return "Drama";
  if (name.includes("english") || name.includes("chall eng") || name.includes("eng lang")) {
    return "English";
  }
  if (name.includes("emergency cert")) return "Emergency Cert";
  if (name.includes("exploring tech")) return "Tech Ed";
  if (
    name.includes("fitness") ||
    name.includes("sports") ||
    name.includes("phys ed") ||
    /\bpe\b/.test(name)
  )
    return "PE";
  if (name.includes("finance")) return "Finance";
  if (name.includes("geography")) return "Geography";
  if (name.includes("journalism")) return "Journalism";
  if (name.includes("health")) return "Health";
  if (name.includes("history")) return "History";
  if (name.includes("leadership")) return "Leadership";
  if (name.includes("marketing") || name.includes("adv market")) {
    return "Marketing";
  }
  if (name.includes("metal fabrication")) return "Metal Fabrication";
  if (name.includes("metal design")) return "Metal Design";
  if (name.includes("ms office cert")) return "Office Cert";
  if (name.includes("photography")) return "Photography";
  if (name.includes("physics")) return "Physics";
  if (name.includes("psychology")) return "Psychology";
  if (name.includes("robotics")) return "Robotics";
  if (/\brs\b/.test(name)) return "Running Start";
  if (name.includes("stained glass")) return "Stained Glass";
  if (name.includes("soc skills")) return "Social Skills";
  if (name.includes("theatre")) return "Theatre";
  if (name.includes("welding")) return "Welding";
  if (name.includes("year book")) return "Yearbook";

  return name;
};
export const simplifyCategory = /* @__PURE__ */ (name: string) => {
  name = name.toLowerCase();

  if (name.includes("formative")) return "assignment";
  if (name.includes("homework")) return "assignment";
  if (name.includes("classwork")) return "assignment";
  if (name.includes("assignment")) return "assignment";
  if (name.includes("practice")) return "assignment";
  if (name.includes("daily work")) return "assignment";
  if (name.includes("participation")) return "assignment";
  if (name.includes("test")) return "test";
  if (name.includes("quiz")) return "test";
  if (name.includes("summative")) return "project";
  if (name.includes("project")) return "project";
  if (name.includes("lab")) return "project";
  if (name.includes("assessment")) return "test";

  return name;
};
export const shortenCategory = /* @__PURE__ */ (name: string) => {
  name = name.replace(/ APCS$/, "");
  name = name.replace("Labs/Projects/Presentations", "Labs/Projects");
  name = name.replace("Assessments, Quizzes, and Projects", "Tests/Projects");
  name = name.replace("Code Your Owns / Quizzes", "Tests/Projects");
  name = name.replace("Completion of Assignments/HW", "HW/Classwork");
  name = name.replace("Homework/Classwork", "HW/Classwork");
  name = name.replace("Classwork/Homework", "HW/Classwork");
  name = name.replace("Homework and Classwork", "HW/Classwork");
  name = name.replace("Classwork and Homework", "HW/Classwork");
  name = name.replace(/^summative assessments$/i, "Summative");
  name = name.replace(/^formative assessments$/i, "Formative");
  name = name.replace(/^summative assessment$/i, "Summative");
  name = name.replace(/^formative assessment$/i, "Formative");
  name = name.replace(/college and career readiness/i, "Life readiness");
  name = name.replace(/lab activities/i, "Labs");
  return name;
};
