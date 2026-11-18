import asyncHandler from "express-async-handler";
import HeadDepart from "../models/headDepartModel.js";
import { uploadFile, deleteFile, discardUploads } from "../utils/files.js";

// The head of the department shown on the home page: photo, name, email and a short message.
// The home page shows the first one, so normally there is only one.
const FOLDER = "mathdep/homepage";

// GET /api/headdepartment (public)
const getAll = asyncHandler(async (req, res) => {
  res.json({ message: "all data", status: 200, data: await HeadDepart.find().sort({ createdAt: 1 }) });
});

// POST /api/headdepartment (admin)
const create = asyncHandler(async (req, res) => {
  const { name, email, description } = req.body;
  if (!req.file || !name || !email || !description) {
    discardUploads(req);
    res.status(400);
    throw new Error("Please add a photo, the name, the email and the message");
  }
  const head = await HeadDepart.create({ name, email, description, image: await uploadFile(req.file, FOLDER) });
  res.status(201).json({ message: "Head of department added", data: head });
});

// PUT /api/headdepartment/:id (admin): the photo changes only if a new one is sent
const update = asyncHandler(async (req, res) => {
  const head = await HeadDepart.findById(req.params.id);
  if (!head) {
    discardUploads(req);
    res.status(404);
    throw new Error("Head of department not found");
  }
  ["name", "email", "description"].forEach((key) => {
    if (req.body[key]) head[key] = req.body[key];
  });
  if (req.file) {
    const old = head.image?.toObject ? head.image.toObject() : head.image;
    head.image = await uploadFile(req.file, FOLDER);
    deleteFile(old);
  }
  res.json({ message: "Head of department updated", data: await head.save() });
});

// DELETE /api/headdepartment/:id (admin)
const remove = asyncHandler(async (req, res) => {
  const head = await HeadDepart.findByIdAndDelete(req.params.id);
  if (!head) {
    res.status(404);
    throw new Error("Head of department not found");
  }
  deleteFile(head.image);
  res.json({ message: "Head of department deleted" });
});

export default { getAll, create, update, remove };
