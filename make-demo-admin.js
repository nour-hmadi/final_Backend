// Creates the demo admin shown on the sign-in page, or puts it back the way it should be.
//   node make-demo-admin.js
import crypto from "crypto";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/userModel.js";
import { DEMO_EMAIL } from "./middlewares/demoMiddleware.js";

const DEMO_PASSWORD = "admin123";

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

const fields = { isAdmin: true, isActive: true, password: await bcrypt.hash(DEMO_PASSWORD, 10) };
const existing = await User.findOne({ email: DEMO_EMAIL });

if (existing) {
  // updateOne skips validation, so it works even if the account is missing a field
  await User.updateOne({ _id: existing._id }, { $set: fields });
} else {
  let file_number;
  do file_number = crypto.randomInt(100000, 1000000);
  while (await User.exists({ file_number }));
  await User.create({
    ...fields,
    first_name: "Demo", last_name: "Admin", email: DEMO_EMAIL,
    isTeacher: false, phone_number: 0, file_number,
    image: { public_id: "demo-avatar",
             url: "https://ui-avatars.com/api/?name=Demo%20Admin&size=512&background=17304d&color=ffffff&bold=true" },
  });
}

console.log(`Demo admin ready: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
await mongoose.disconnect();
