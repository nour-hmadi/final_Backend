// One-time: copies the texts that were written into the frontend (src/content/site.js and a few pages)
// into the database, so the admin can edit them from the dashboard. Only empty lists are filled,
// and existing settings are kept, so running it again changes nothing.
//   node seed-content.js ~/projects/mathdep-frontend/src/content/site.js
import fs from "fs";
import os from "os";
import path from "path";
import { pathToFileURL } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Content from "./models/contentModel.js";
import Settings from "./models/settingsModel.js";

dotenv.config();
const siteFile = process.argv[2];
if (!siteFile || !fs.existsSync(siteFile)) {
  console.log("Usage: node seed-content.js <path to the frontend's src/content/site.js>");
  process.exit(1);
}

// site.js is a frontend file; a copy named .mjs lets Node read its "export const" lines
const copy = path.join(os.tmpdir(), "site-content.mjs");
fs.copyFileSync(siteFile, copy);
const { PROGRAMS, COURSES, CALENDAR, ADMISSIONS } = await import(pathToFileURL(copy).href);

const items = [];
PROGRAMS.forEach((program, i) => items.push({ kind: "program", order: i + 1, data: program }));
COURSES.forEach((year, yearIndex) => year.semesters.forEach((semester) => semester.courses.forEach(([code, name, credits], i) =>
  items.push({ kind: "course", order: i + 1,
               data: { year: yearIndex + 1, semester: Number(semester.name.replace(/\D/g, "")), code, name, credits } }))));
CALENDAR.semesters.forEach((semester) => semester.rows.forEach(([label, dates], i) =>
  items.push({ kind: "calendar", order: i + 1, data: { semester: semester.name, label, dates } })));
ADMISSIONS.requirements.forEach(([text, appliesTo], i) => items.push({ kind: "requirement", order: i + 1, data: { text, appliesTo } }));
ADMISSIONS.steps.forEach(([title, text], i) => items.push({ kind: "step", order: i + 1, data: { title, text } }));
ADMISSIONS.fees.forEach(([program, fee], i) => items.push({ kind: "fee", order: i + 1, data: { program, fee } }));

const SETTINGS = {
  heroLead: "Pure and applied mathematics, from first-year calculus to research in analysis, algebra, statistics and "
    + "numerical computing. A small department where every student knows their professors.",
  studentsCount: "350+",
  aboutDepartment: "The Department of Mathematics teaches pure and applied mathematics, from first-year calculus and "
    + "linear algebra to master's-level analysis, statistics and numerical computing. Its teachers combine teaching with "
    + "research, and its graduates go on to teach, to study further, or to work with data in industry and finance.",
  aboutCommunity: "Beyond the classes, students meet in the Math Community: they post questions, share solutions and "
    + "organise the department's competitions and seminars. A teacher reviews every post before it appears, so the "
    + "space stays helpful and respectful.",
  phone: "+961 1 000 000",
  email: "mathdep@example.edu.lb",
  address: "Hadath campus, Faculty of Sciences, building B, floor 2",
  officeHours: "Monday to Thursday 9:00 to 13:00, Friday 9:00 to 12:00",
  instagram: "", facebook: "", youtube: "", linkedin: "",
  examRules: CALENDAR.rules,
};

await mongoose.connect(process.env.MONGO_URI);
for (const kind of [...new Set(items.map((item) => item.kind))]) {
  if (await Content.exists({ kind })) {
    console.log(`${kind}: already has items, left as it is`);
    continue;
  }
  const rows = items.filter((item) => item.kind === kind);
  await Content.insertMany(rows);
  console.log(`${kind}: ${rows.length} added`);
}
if (await Settings.exists({ key: "site" })) console.log("settings: already there, left as they are");
else {
  await Settings.create({ key: "site", data: SETTINGS });
  console.log("settings: added");
}
await mongoose.disconnect();
