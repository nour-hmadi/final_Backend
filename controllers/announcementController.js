import asyncHandler from "express-async-handler";
import Announcement from "../models/AnnouncementModel.js";

// News and events. The public gets only what belongs on the site today;
// the admin gets everything, each item with its status (visible, past-due, kept, auto-hidden, hidden).
const newestFirst = (a, b) => (b.startDate || b.createdAt) - (a.startDate || a.createdAt);
const FIELDS = ["title", "description", "type", "startDate", "endDate", "visibleUntil", "autoHide", "hidden", "keepAfterDue"];

// Only the fields the admin may set; an empty date ("") clears it
const pick = (body) => {
  const fields = {};
  FIELDS.forEach((key) => {
    if (body[key] !== undefined) fields[key] = body[key] === "" ? null : body[key];
  });
  return fields;
};

const checkDates = (item, res) => {
  const fail = (message) => {
    res.status(400);
    throw new Error(message);
  };
  if (!item.startDate) fail("Please add the date");
  if (item.endDate && item.endDate < item.startDate) fail("The end date can't be before the start date");
  if (item.visibleUntil && item.visibleUntil < item.startDate) fail("The due date can't be before the start date");
};

// GET /api/announcements (public)
const getAll = asyncHandler(async (req, res) => {
  const now = new Date();
  const items = (await Announcement.find()).filter((item) => item.isOnSite(now)).sort(newestFirst);
  res.json({ message: "all data", status: 200, data: items });
});

// GET /api/announcements/all (admin)
const getAllForAdmin = asyncHandler(async (req, res) => {
  const now = new Date();
  const items = (await Announcement.find()).sort(newestFirst).map((item) => ({ ...item.toJSON(), status: item.status(now) }));
  res.json({ message: "all data", status: 200, data: items });
});

// GET /api/announcements/:id (public, only if it is on the site)
const getById = asyncHandler(async (req, res) => {
  const item = await Announcement.findById(req.params.id);
  if (!item || !item.isOnSite()) {
    res.status(404);
    throw new Error("Not found");
  }
  res.json({ data: item });
});

// POST /api/announcements (admin)
const create = asyncHandler(async (req, res) => {
  const item = new Announcement(pick(req.body));
  checkDates(item, res);
  await item.save();
  res.status(201).json({ message: "data created successfully", newdata: item });
});

// PUT /api/announcements/:id (admin). A new due date clears "kept", so the new date is watched again.
const update = asyncHandler(async (req, res) => {
  const item = await Announcement.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Not found");
  }
  const fields = pick(req.body);
  const time = (date) => (date ? new Date(date).getTime() : null);
  if ("visibleUntil" in fields && !("keepAfterDue" in fields) && time(fields.visibleUntil) !== time(item.visibleUntil)) {
    fields.keepAfterDue = false;
  }
  item.set(fields);
  checkDates(item, res);
  res.json(await item.save());
});

// DELETE /api/announcements/:id (admin)
const remove = asyncHandler(async (req, res) => {
  const item = await Announcement.findByIdAndDelete(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Not found");
  }
  res.json({ message: "Deleted" });
});

export default { getAll, getAllForAdmin, getById, create, update, remove };
