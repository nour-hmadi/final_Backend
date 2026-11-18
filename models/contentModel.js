import mongoose from "mongoose";

// Content for the pages that used to be written into the frontend: programs, courses, calendar dates,
// admission requirements, steps and fees. One collection, one row per item; "kind" says which list it
// belongs to, and "data" holds its fields (checked against the list of allowed fields in the controller).
const contentSchema = new mongoose.Schema(
  {
    kind: { type: String, required: true, index: true },
    order: { type: Number, default: 0 },                  // smaller first
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    pdf: { public_id: String, url: String, name: String, resource_type: String },   // e.g. a course syllabus
  },
  {
    collection: "content",
    timestamps: true,
    minimize: false,
    // Sent flat: { _id, kind, order, name, level, ..., pdf }
    toJSON: { transform: (doc, ret) => { const { data, ...rest } = ret; return { ...data, ...rest }; } },
  }
);

const Content = mongoose.model("Content", contentSchema);

export default Content;
