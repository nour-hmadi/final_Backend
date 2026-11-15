// Replaces the site's test content with a clean, clearly fictional demo set.
//
// Test teachers are hidden from the staff pages (their accounts and logins stay). The test news, research
// posts and head of department are rewritten in place, and any left over beyond the demo set are deleted.
// Each research post shows a picture drawn by the frontend's scripts/research_images.py, which the site
// serves at /images/research/. The demo teachers are added once: running it again updates them.
// Everything it changes or deletes is first saved to backups/ (gitignored: it holds emails and passwords).
//
//   node seed.js            dry run: shows what would change, changes nothing
//   node seed.js --confirm  saves the backup, then applies the changes
import fs from "fs";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const avatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=512&background=17304d&color=ffffff&bold=true`;
const picture = (name) => ({ public_id: "demo-research", url: `/images/research/${name}.png` });

const TEACHERS = [   // first name, last name, title, description: all fictional
  ["Rana", "Khalil", "Professor of Algebra", "Linear and bilinear algebra, and algebraic structures."],
  ["Karim", "Saad", "Associate Professor of Analysis", "Real analysis and differential equations."],
  ["Maya", "Haddad", "Associate Professor of Statistics", "Probability theory and stochastic processes."],
  ["Samir", "Nassar", "Assistant Professor of Numerical Analysis", "Numerical methods and scientific computing."],
  ["Lina", "Farah", "Assistant Professor of Topology", "General topology and geometry."],
  ["Omar", "Aziz", "Lecturer in Optimization", "Linear programming and convex optimization."],
];
const NEWS = [
  { type: "event", day: "2", month: "December", title: "Open day for new students",
    description: "Meet the professors, visit the classrooms and ask your questions about our mathematics programs. Building B, from 10:00 to 13:00." },
  { type: "announcement", day: "9", month: "December", title: "Fall exam schedule published",
    description: "The schedule of the fall semester exams is now on the Teaching Schedules page. Please check your exam rooms in advance." },
  { type: "event", day: "16", month: "December", title: "Seminar: graphs and networks",
    description: "A one-hour talk on how graph theory models transport and social networks. Open to all students, no registration needed." },
  { type: "announcement", day: "6", month: "January", title: "Spring registration opens",
    description: "Registration for spring courses opens on 6 January and closes on 20 January. Contact the secretariat for any course change." },
  { type: "event", day: "21", month: "January", title: "Department math competition",
    description: "Teams of three solve ten problems in three hours. Prizes for the top three teams; sign up at the secretariat." },
];
const RESEARCH = [
  { title: "Graph theory for public transport", image: picture("graph-theory-transport"),
    description: "Modelling a city's bus lines as a graph to find the shortest and most robust routes, and the stops whose closure would disrupt the network most." },
  { title: "Numerical methods for heat diffusion", image: picture("heat-diffusion"),
    description: "Comparing finite-difference schemes for the heat equation: how accuracy, stability and computing time change with the grid size." },
  { title: "Bayesian statistics with small samples", image: picture("bayesian-small-samples"),
    description: "How prior knowledge improves estimates when only a few observations are available, with examples from quality control." },
  { title: "Linear algebra behind machine learning", image: picture("linear-algebra-svd"),
    description: "Why matrix factorisation powers recommendation systems and image compression, explained with the singular value decomposition." },
  { title: "Prime numbers and online security", image: picture("primes-security"),
    description: "How the difficulty of factoring large numbers keeps online payments safe, and what quantum computers could change." },
  { title: "Mathematical models of epidemics", image: picture("sir-epidemic"),
    description: "Using the SIR model to estimate how fast an infection spreads, and how vaccination flattens the curve." },
];
const HEAD = {
  name: "Prof. Nadim Saliba",
  email: "head.mathdep@example.com",
  description: "Welcome to the Department of Mathematics. Our programs cover pure and applied mathematics, from algebra and " +
    "analysis to statistics and numerical computing, and prepare students for teaching, research and careers in data and finance.",
  image: { public_id: "demo-avatar", url: avatar("Nadim Saliba") },
};

const apply = process.argv.includes("--confirm");
const name = (user) => (user.first_name ? `${user.first_name} ${user.last_name}` : user.name);
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

await mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection.db;
const users = db.collection("users");
const news = db.collection("Announcement");
const research = db.collection("Research");
const head = db.collection("headDepartment");

const demoEmails = TEACHERS.map(([first, last]) => `${first}.${last}@example.com`.toLowerCase());
const testTeachers = await users
  .find({ $or: [{ isTeacher: true }, { type: "teacher" }], email: { $nin: demoEmails } }).toArray();
const oldNews = await news.find().sort({ createdAt: 1 }).toArray();
const oldResearch = await research.find().sort({ createdAt: 1 }).toArray();
const oldHead = await head.find().sort({ createdAt: 1 }).toArray();

console.log(`Teachers to hide from the staff pages: ${testTeachers.length} (${testTeachers.map(name).join(", ")})`);
console.log(`Demo teachers to add or update: ${TEACHERS.length}`);
const extra = (old, demo) => old.slice(demo.length);          // test documents beyond the demo set: deleted
console.log(`News to rewrite: ${Math.min(oldNews.length, NEWS.length)} of ${oldNews.length}, to add: ${Math.max(NEWS.length - oldNews.length, 0)}, to delete: ${extra(oldNews, NEWS).length}`);
console.log(`Research posts to rewrite: ${Math.min(oldResearch.length, RESEARCH.length)} of ${oldResearch.length}, to delete: ${extra(oldResearch, RESEARCH).length}`);
console.log(`Head of department to rewrite: ${oldHead.length ? 1 : 0}, to add: ${oldHead.length ? 0 : 1}, to delete: ${extra(oldHead, [HEAD]).length}`);
if (!apply) {
  console.log("Dry run: nothing changed. To apply: node seed.js --confirm");
  await mongoose.disconnect();
  process.exit(0);
}

fs.mkdirSync("backups", { recursive: true });
const backup = `backups/before-seed-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
fs.writeFileSync(backup, JSON.stringify({ users: testTeachers, announcements: oldNews, research: oldResearch, headDepartment: oldHead }, null, 2));
console.log(`Backup saved: ${backup}`);

const hidden = testTeachers.map((user) => user._id);
await users.updateMany({ _id: { $in: hidden }, isTeacher: true }, { $set: { isTeacher: false } });
await users.updateMany({ _id: { $in: hidden }, type: "teacher" }, { $set: { type: "student" } });

const unusable = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10);   // nobody knows it: demo accounts can't log in
for (const [i, [first, last, title, description]] of TEACHERS.entries()) {
  await users.updateOne(
    { email: demoEmails[i] },
    {
      $set: { first_name: first, last_name: last, title, description, isTeacher: true, isActive: true, isAdmin: false,
              image: { public_id: "demo-avatar", url: avatar(`${first} ${last}`) }, updatedAt: new Date() },
      $setOnInsert: { password: unusable, phone_number: 0, file_number: 990001 + i, createdAt: new Date(), __v: 0 },
    },
    { upsert: true },
  );
}

for (const [i, item] of NEWS.entries()) {
  const fields = { ...item, createdAt: daysAgo(i + 1), updatedAt: new Date() };
  if (oldNews[i]) await news.updateOne({ _id: oldNews[i]._id }, { $set: fields });
  else await news.insertOne({ ...fields, __v: 0 });
}

for (const [i, item] of RESEARCH.entries()) {   // dated 15 days apart, oldest first: reruns keep the same order
  const fields = { ...item, createdAt: daysAgo(15 * (RESEARCH.length - i)), updatedAt: new Date() };
  if (oldResearch[i]) await research.updateOne({ _id: oldResearch[i]._id }, { $set: fields });
}

if (oldHead[0]) await head.updateOne({ _id: oldHead[0]._id }, { $set: { ...HEAD, updatedAt: new Date() } });
else await head.insertOne({ ...HEAD, createdAt: new Date(), updatedAt: new Date(), __v: 0 });

const ids = (documents) => documents.map((document) => document._id);
await news.deleteMany({ _id: { $in: ids(extra(oldNews, NEWS)) } });
await research.deleteMany({ _id: { $in: ids(extra(oldResearch, RESEARCH)) } });
await head.deleteMany({ _id: { $in: ids(extra(oldHead, [HEAD])) } });

console.log("Done: the site now shows the demo content.");
await mongoose.disconnect();
