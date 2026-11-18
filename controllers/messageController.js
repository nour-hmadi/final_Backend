import asyncHandler from "express-async-handler";
import Message from "../models/messageModel.js";
import Subscriber from "../models/subscriberModel.js";

// Contact messages and newsletter sign-ups. Visitors can only send; only admins can read.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fail = (res, status, message) => {
  res.status(status);
  throw new Error(message);
};

// POST /api/messages (public). "website" is a hidden field: people leave it empty, spam robots fill it in.
const send = asyncHandler(async (req, res) => {
  const { name, email, message, website } = req.body;
  if (website) return res.status(201).json({ message: "Message sent" });   // a robot: pretend it worked
  if (!name?.trim() || !EMAIL.test(email || "") || !message?.trim()) fail(res, 400, "Please fill in your name, a valid email and your message");
  if (message.length > 5000) fail(res, 400, "Your message is too long (5,000 characters at most)");
  await Message.create({ name: name.trim(), email: email.trim(), message: message.trim() });
  res.status(201).json({ message: "Message sent" });
});

// GET /api/messages (admin): newest first
const list = asyncHandler(async (req, res) => {
  res.json({ data: await Message.find().sort({ createdAt: -1 }) });
});

// PUT /api/messages/:id (admin): mark as read or unread
const markRead = asyncHandler(async (req, res) => {
  const item = await Message.findByIdAndUpdate(req.params.id, { read: req.body.read !== false }, { new: true });
  if (!item) fail(res, 404, "Message not found");
  res.json({ data: item });
});

// DELETE /api/messages/:id (admin)
const remove = asyncHandler(async (req, res) => {
  if (!(await Message.findByIdAndDelete(req.params.id))) fail(res, 404, "Message not found");
  res.json({ message: "Message deleted" });
});

// POST /api/subscribers (public): signing up twice is fine, the address is kept once
const subscribe = asyncHandler(async (req, res) => {
  const { email, website } = req.body;
  if (website) return res.status(201).json({ message: "Subscribed" });
  if (!EMAIL.test(email || "")) fail(res, 400, "Please enter a valid email");
  await Subscriber.updateOne({ email: email.trim().toLowerCase() }, { $setOnInsert: { email: email.trim().toLowerCase() } }, { upsert: true });
  res.status(201).json({ message: "Subscribed" });
});

// GET /api/subscribers (admin) and DELETE /api/subscribers/:id (admin)
const subscribers = asyncHandler(async (req, res) => {
  res.json({ data: await Subscriber.find().sort({ createdAt: -1 }) });
});

const unsubscribe = asyncHandler(async (req, res) => {
  if (!(await Subscriber.findByIdAndDelete(req.params.id))) fail(res, 404, "Subscriber not found");
  res.json({ message: "Removed from the newsletter" });
});

export default { send, list, markRead, remove, subscribe, subscribers, unsubscribe };
