import fs from "fs";
import asyncHandler from "express-async-handler";
import { v2 as cloudinary } from "cloudinary";
import Gallery from "../models/galleryModel.js";

// Gallery photos. The file goes to Cloudinary (folder mathdep/gallery); the database keeps its address.
// Demo photos (public_id starting with "demo-") are files in the frontend, so Cloudinary is never asked to delete them.

const uploadPhoto = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, { folder: "mathdep/gallery" });
    return { public_id: result.public_id, url: result.secure_url };
  } finally {
    fs.promises.unlink(file.path).catch(() => {});   // the temporary copy in uploads/ is no longer needed
  }
};

const deletePhoto = (publicId) => {
  if (publicId && !publicId.startsWith("demo-")) cloudinary.uploader.destroy(publicId).catch(() => {});
};

// GET /api/gallery (public): newest first
const getAll = asyncHandler(async (req, res) => {
  res.json({ message: "all data", status: 200, data: await Gallery.find().sort({ createdAt: -1 }) });
});

// GET /api/gallery/:id (public)
const getById = asyncHandler(async (req, res) => {
  const photo = await Gallery.findById(req.params.id);
  if (!photo) {
    res.status(404);
    throw new Error("Photo not found");
  }
  res.json({ data: photo });
});

// POST /api/gallery (admin): a photo file, a title and a section
const create = asyncHandler(async (req, res) => {
  const { title, section } = req.body;
  if (!req.file || !title) {
    if (req.file) fs.promises.unlink(req.file.path).catch(() => {});
    res.status(400);
    throw new Error("Please add a photo and a title");
  }
  const photo = await Gallery.create({ title, section: section || "campus", image: await uploadPhoto(req.file) });
  res.status(201).json({ message: "Photo added", data: photo });
});

// PUT /api/gallery/:id (admin): a new title or section; the photo changes only if a new file is sent
const update = asyncHandler(async (req, res) => {
  const photo = await Gallery.findById(req.params.id);
  if (!photo) {
    res.status(404);
    throw new Error("Photo not found");
  }
  if (req.body.title) photo.title = req.body.title;
  if (req.body.section) photo.section = req.body.section;
  if (req.file) {
    const oldId = photo.image?.public_id;
    photo.image = await uploadPhoto(req.file);
    deletePhoto(oldId);
  }
  res.json({ message: "Photo updated", data: await photo.save() });
});

// DELETE /api/gallery/:id (admin)
const remove = asyncHandler(async (req, res) => {
  const photo = await Gallery.findByIdAndDelete(req.params.id);
  if (!photo) {
    res.status(404);
    throw new Error("Photo not found");
  }
  deletePhoto(photo.image?.public_id);
  res.json({ message: "Photo deleted" });
});

export default { getAll, getById, create, update, remove };
