// Makes a user an admin and gives them a new password, printed once.
// If no user has that email, it creates one with the given name.
//   node make-admin.js head.mathdep@example.com Nadim Saliba
import crypto from "crypto";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/userModel.js";

dotenv.config();
const [email, first_name, last_name] = process.argv.slice(2);
if (!email) {
  console.log("Usage: node make-admin.js <email> [first name] [last name]");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);
const password = crypto.randomBytes(9).toString("base64url");
const hash = await bcrypt.hash(password, 10);
const existing = await User.findOne({ email });

if (existing) {
  // updateOne skips validation, so older accounts with missing fields still work
  await User.updateOne({ _id: existing._id }, { $set: { isAdmin: true, isActive: true, password: hash } });
} else {
  if (!first_name || !last_name) {
    console.log(`No user has the email ${email}. To create one, add a first and last name.`);
    process.exit(1);
  }
  let file_number;
  do file_number = crypto.randomInt(100000, 1000000);
  while (await User.exists({ file_number }));
  const name = `${first_name} ${last_name}`;
  await User.create({
    first_name, last_name, email, password: hash,
    isTeacher: false, isAdmin: true, isActive: true,
    phone_number: 0, file_number,
    image: { public_id: "demo-avatar",
             url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=512&background=17304d&color=ffffff&bold=true` },
  });
}

console.log(`${email} is now an admin.`);
console.log(`Password (shown once, save it now): ${password}`);
await mongoose.disconnect();
