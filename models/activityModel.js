import mongoose from "mongoose";

// One row per change an admin makes (create, update or delete), e.g. action "announcements.create".
// Rows older than 180 days are deleted by MongoDB itself (the "expires" index).
const activitySchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 180 },
});

activitySchema.index({ admin: 1, createdAt: -1 });

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;
