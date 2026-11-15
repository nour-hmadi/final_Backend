// Fills the Math Community with demo students, posts and comments (all fictional).
//
// Five demo students are added once (running it again updates them). The old test posts and comments are
// saved to backups/ and replaced by the demo set. Posts and comments carry the author's name, as the
// site shows it. Everything can be re-run: the result is the same.
//
//   node seed_community.js            dry run: shows what would change, changes nothing
//   node seed_community.js --confirm  saves the backup, then applies the changes
//
// The demo students share one password so you can sign in as one of them in a demo. Put it in .env as
// DEMO_PASSWORD=...; if it is missing, the script makes one and prints it once (keep it out of git and chat).
import fs from "fs";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const avatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=256&background=4aa3df&color=ffffff&bold=true`;
const daysAgo = (days, hour = 10) => new Date(Date.now() - days * 24 * 60 * 60 * 1000 + hour * 3600 * 1000 - 10 * 3600 * 1000);

const STUDENTS = [["Rami", "Khoury"], ["Sara", "Mansour"], ["Jad", "Abou Jaoude"], ["Nour", "Itani"], ["Elie", "Sleiman"]];
const POSTS = [
  { by: 0, days: 2, status: true, title: "How do I prove that √2 is irrational?",
    description: "I know the proof is by contradiction: suppose √2 = p/q in lowest terms. I get to 2q² = p², so p is even. Then what makes q even too? I lose the thread at that step." },
  { by: 1, days: 4, status: true, title: "Study group for Analysis III, Tuesdays at 16:00",
    description: "We meet in room B204 to work through the exercise sheets together before the midterm. Bring your questions on sequences of functions; everyone is welcome." },
  { by: 2, days: 6, status: true, title: "Is the Linear Algebra II exam open book?",
    description: "Last year it was closed book with a one-page formula sheet allowed. Does anyone know the rule this year?" },
  { by: 3, days: 9, status: true, title: "Python notebooks for Numerical Methods",
    description: "I put my notes for the finite-difference lectures in a notebook with plots of the stability condition. Happy to share it, reply here if you want the link." },
  { by: 4, days: 12, status: true, title: "Intuition for the Jacobian determinant?",
    description: "I can compute it, but why does |det J| appear in the change of variables formula for double integrals? A picture would help." },
  { by: 1, days: 15, status: true, title: "Math competition: teams of three, sign up by Friday",
    description: "The department competition is on 21 January. We still need one person for our team, preferably someone who likes combinatorics." },
  { by: 0, days: 20, status: true, title: "Recommended book for probability?",
    description: "The course slides are good but I would like a book with many solved exercises for the Probability course of semester 3." },
  { by: 2, days: 0, status: false, title: "Lost: a blue notebook in room A110",
    description: "Left after the Topology lecture on Monday. It has all my notes for the semester. Please message me if you found it." },
];
const COMMENTS = [
  [0, 1, 1, "If q were odd, q² would be odd and 2q² could not equal p² = 4k². So q is even too, and p/q was not in lowest terms."],
  [0, 4, 1, "The key fact is: a square is even only if its root is even. Prove that small lemma first and the rest follows."],
  [0, 0, 1, "Thank you both, the lemma was the missing piece."],
  [1, 3, 3, "Count me in. Can we also go over uniform convergence?"],
  [1, 1, 3, "Yes, that is the plan for the first session."],
  [2, 0, 5, "The professor said in class: closed book, one A4 formula sheet, handwritten."],
  [3, 2, 8, "I would like the link, thanks for sharing."],
  [3, 4, 8, "Me too. Did you include the implicit scheme as well?"],
  [4, 1, 11, "Think of a tiny square in the (u, v) plane: the map sends it to a small parallelogram, and |det J| is the ratio of the areas."],
  [4, 4, 11, "That is exactly the picture I needed."],
  [5, 0, 14, "I like combinatorics. Where do we sign up?"],
  [6, 3, 19, "Blitzstein and Hwang, Introduction to Probability. Free online, with many exercises and solutions."],
];

const apply = process.argv.includes("--confirm");
await mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection.db;
const users = db.collection("users");
const posts = db.collection("posts");
const comments = db.collection("comments");

const emails = STUDENTS.map(([first, last]) => `${first}.${last}@example.com`.replace(/ /g, "").toLowerCase());
const existingStudents = await users.find({ email: { $in: emails } }).toArray();
const oldPosts = await posts.find().toArray();
const oldComments = await comments.find().toArray();

console.log(`Demo students to add: ${STUDENTS.length - existingStudents.length}, to update: ${existingStudents.length}`);
console.log(`Posts to replace: ${oldPosts.length} old, ${POSTS.length} new (${POSTS.filter((p) => p.status).length} approved, ${POSTS.filter((p) => !p.status).length} pending)`);
console.log(`Comments to replace: ${oldComments.length} old, ${COMMENTS.length} new`);
if (!apply) {
  console.log("Dry run: nothing changed. To apply: node seed_community.js --confirm");
  await mongoose.disconnect();
  process.exit(0);
}

fs.mkdirSync("backups", { recursive: true });
const backup = `backups/before-community-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
fs.writeFileSync(backup, JSON.stringify({ posts: oldPosts, comments: oldComments }, null, 2));
console.log(`Backup saved: ${backup}`);

let password = process.env.DEMO_PASSWORD;
if (!password) {
  password = crypto.randomBytes(9).toString("base64url");
  console.log(`No DEMO_PASSWORD in .env: the demo students' password is ${password} (add it to .env as DEMO_PASSWORD to keep it)`);
}
const hash = await bcrypt.hash(password, 10);
const ids = [];
for (const [i, [first, last]] of STUDENTS.entries()) {
  const name = `${first} ${last}`;
  const result = await users.findOneAndUpdate(
    { email: emails[i] },
    { $set: { first_name: first, last_name: last, isTeacher: false, isAdmin: false, isActive: true, password: hash,
              image: { public_id: "demo-avatar", url: avatar(name) }, updatedAt: new Date() },
      $setOnInsert: { phone_number: 0, file_number: 880001 + i, createdAt: new Date(), __v: 0 } },
    { upsert: true, returnDocument: "after" },
  );
  ids.push((result.value || result)._id);
}

await comments.deleteMany({});
await posts.deleteMany({});
const postIds = [];
for (const post of POSTS) {
  const [first, last] = STUDENTS[post.by];
  const { insertedId } = await posts.insertOne({
    user: ids[post.by], name: `${first} ${last}`, title: post.title, description: post.description,
    image: avatar(`${first} ${last}`), status: post.status, likedBy: [], likesCount: 0, liked: false,
    createdAt: daysAgo(post.days), updatedAt: daysAgo(post.days), __v: 0,
  });
  postIds.push(insertedId);
}
for (const [postIndex, by, days, description] of COMMENTS) {
  const [first, last] = STUDENTS[by];
  await comments.insertOne({ user: ids[by], name: `${first} ${last}`, description, post: postIds[postIndex], liked: false,
                             createdAt: daysAgo(days, 15), updatedAt: daysAgo(days, 15), __v: 0 });
}
console.log(`Done: ${STUDENTS.length} demo students, ${POSTS.length} posts, ${COMMENTS.length} comments.`);
await mongoose.disconnect();
