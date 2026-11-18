import asyncHandler from "express-async-handler";
import Activity from "../models/activityModel.js";

const DAY = 24 * 60 * 60 * 1000;

// GET /api/activity/me/top (admin): the signed-in admin's most frequent actions in the last 30 days
const myTopActions = asyncHandler(async (req, res) => {
  const top = await Activity.aggregate([
    { $match: { admin: req.user._id, createdAt: { $gte: new Date(Date.now() - 30 * DAY) } } },
    { $group: { _id: "$action", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 6 },
  ]);
  res.json({ data: top.map((item) => ({ action: item._id, count: item.count })) });
});

// GET /api/activity/recent (admin): the last 15 changes by any admin, and who made them
const recent = asyncHandler(async (req, res) => {
  const items = await Activity.find().sort({ createdAt: -1 }).limit(15).populate("admin", "first_name last_name name");
  res.json({
    data: items.map((item) => ({
      _id: item._id,
      action: item.action,
      createdAt: item.createdAt,
      admin: item.admin ? (item.admin.first_name ? `${item.admin.first_name} ${item.admin.last_name}` : item.admin.name) : "A deleted account",
    })),
  });
});

export default { myTopActions, recent };
