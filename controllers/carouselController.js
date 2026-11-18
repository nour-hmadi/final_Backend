import asyncHandler from "express-async-handler";
import Carousel from "../models/carouselModel.js";
import { uploadFile, deleteFile, discardUploads } from "../utils/files.js";

// The pictures at the top of the home page. They take turns, oldest first.
const FOLDER = "mathdep/homepage";

// GET /api/carousel (public)
const getAll = asyncHandler(async (req, res) => {
  res.json({ message: "all data", status: 200, data: await Carousel.find().sort({ createdAt: 1 }) });
});

// POST /api/carousel (admin): a picture and an optional title
const create = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Please add a picture");
  }
  const slide = await Carousel.create({ title: req.body.title, image: await uploadFile(req.file, FOLDER) });
  res.status(201).json({ message: "Picture added", data: slide });
});

// PUT /api/carousel/:id (admin): a new title, and a new picture only if one is sent
const update = asyncHandler(async (req, res) => {
  const slide = await Carousel.findById(req.params.id);
  if (!slide) {
    discardUploads(req);
    res.status(404);
    throw new Error("Picture not found");
  }
  if (req.body.title !== undefined) slide.title = req.body.title;
  if (req.file) {
    const old = slide.image?.toObject ? slide.image.toObject() : slide.image;
    slide.image = await uploadFile(req.file, FOLDER);
    deleteFile(old);
  }
  res.json({ message: "Picture updated", data: await slide.save() });
});

// DELETE /api/carousel/:id (admin)
const remove = asyncHandler(async (req, res) => {
  const slide = await Carousel.findByIdAndDelete(req.params.id);
  if (!slide) {
    res.status(404);
    throw new Error("Picture not found");
  }
  deleteFile(slide.image);
  res.json({ message: "Picture deleted" });
});

export default { getAll, create, update, remove };
