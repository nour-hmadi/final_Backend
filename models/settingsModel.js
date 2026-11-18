import mongoose from "mongoose";

// The site's single texts and contact details (one document): about texts, home page text,
// phone, email, address, office hours, social links and the exam rules.
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "site", unique: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { collection: "settings", timestamps: true, minimize: false }
);

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
