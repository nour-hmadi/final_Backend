import mongoose from "mongoose";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];
const DAY = 24 * 60 * 60 * 1000;

// News and events. startDate is the event's day, or the first day of a period (e.g. registration).
// visibleUntil is the due date. After it the item is "past due": with autoHide it leaves the site
// by itself; without it, it stays and the dashboard flags it until the admin hides it or keeps it.
const AnnouncementSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true },              // "announcement" or "event"
    startDate: { type: Date },
    endDate: { type: Date },                             // optional: the last day of a period
    visibleUntil: { type: Date },                        // the due date (empty: no due date)
    autoHide: { type: Boolean, default: false },         // hide by itself after the due date
    hidden: { type: Boolean, default: false },           // hidden by the admin
    keepAfterDue: { type: Boolean, default: false },     // the admin chose to keep it after the due date
    day: { type: String },                               // older items had only a day and a month;
    month: { type: String },                             // they are kept in step with startDate
  },
  {
    collection: "Announcement",
    timestamps: true,
  }
);

AnnouncementSchema.pre("save", function syncDayAndMonth(next) {
  if (this.startDate) {
    this.day = String(this.startDate.getUTCDate());
    this.month = MONTHS[this.startDate.getUTCMonth()];
  }
  next();
});

// Past due from the day after visibleUntil, so the due date itself still counts
AnnouncementSchema.methods.isPastDue = function isPastDue(now = new Date()) {
  return Boolean(this.visibleUntil) && now.getTime() >= this.visibleUntil.getTime() + DAY;
};

// Where the item stands today: visible, past-due, kept, auto-hidden or hidden
AnnouncementSchema.methods.status = function status(now = new Date()) {
  if (this.hidden) return "hidden";
  if (!this.isPastDue(now)) return "visible";
  if (this.autoHide) return "auto-hidden";
  return this.keepAfterDue ? "kept" : "past-due";
};

AnnouncementSchema.methods.isOnSite = function isOnSite(now = new Date()) {
  return ["visible", "past-due", "kept"].includes(this.status(now));
};

const Announcement = mongoose.model("Announcement", AnnouncementSchema);

export default Announcement;
