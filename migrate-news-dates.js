// One-time: older news items have only a day and a month. This gives each one a full date
// (startDate), choosing the year that puts it nearest to today, and gives events a due date
// three days later. Items that already have a startDate are left alone, so running it twice is safe.
import dotenv from "dotenv";
import mongoose from "mongoose";
import Announcement from "./models/AnnouncementModel.js";

dotenv.config();
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const DAY = 24 * 60 * 60 * 1000;

await mongoose.connect(process.env.MONGO_URI);
const items = await Announcement.find({ startDate: { $exists: false } });
const today = new Date();

for (const item of items) {
  const month = MONTHS.indexOf(String(item.month).toLowerCase().slice(0, 3));
  const day = Number(item.day);
  if (month < 0 || !day) {
    console.log(`Skipped "${item.title}": no usable day and month`);
    continue;
  }
  let year = today.getUTCFullYear();
  if (Date.UTC(year, month, day) < today.getTime() - 150 * DAY) year += 1;   // long past: it means next year
  item.startDate = new Date(Date.UTC(year, month, day));
  if (item.type === "event") item.visibleUntil = new Date(Date.UTC(year, month, day + 3));
  await item.save();
  console.log(`${item.startDate.toISOString().slice(0, 10)}  ${item.type}  ${item.title}`);
}

console.log(`${items.length} item(s) without a full date were checked.`);
await mongoose.disconnect();
