import asyncHandler from "express-async-handler";
import Research from "../models/researchModel.js";
import { uploadFile, deleteFile, discardUploads } from "../utils/files.js";

// Research posts: a picture, a text, the authors, and an optional PDF of the full paper.
// The public sees posts that aren't hidden; the admin sees all of them.
const FOLDER = "mathdep/research";
const fileOf = (req, field) => req.files?.[field]?.[0];

// GET /api/research (public)
const getAll = asyncHandler(async (req, res) => {
  res.json({ message: "all data", status: 200, data: await Research.find({ hidden: { $ne: true } }).sort({ createdAt: -1 }) });
});

// GET /api/research/all (admin)
const getAllForAdmin = asyncHandler(async (req, res) => {
  res.json({ message: "all data", status: 200, data: await Research.find().sort({ createdAt: -1 }) });
});

// GET /api/research/:id (public, unless hidden)
const getById = asyncHandler(async (req, res) => {
  const post = await Research.findById(req.params.id);
  if (!post || post.hidden) {
    res.status(404);
    throw new Error("Research post not found");
  }
  res.json({ data: post });
});

// POST /api/research (admin): title, description, authors, a picture, and maybe a PDF
const create = asyncHandler(async (req, res) => {
  const { title, description, authors } = req.body;
  if (!title || !description || !fileOf(req, "image")) {
    discardUploads(req);
    res.status(400);
    throw new Error("Please add a title, a text and a picture");
  }
  const post = new Research({ title, description, authors, image: await uploadFile(fileOf(req, "image"), FOLDER) });
  if (fileOf(req, "pdf")) post.pdf = await uploadFile(fileOf(req, "pdf"), FOLDER);
  res.status(201).json({ message: "Research post added", data: await post.save() });
});

// PUT /api/research/:id (admin). Files change only when new ones are sent; removePdf=true removes the PDF.
const update = asyncHandler(async (req, res) => {
  const post = await Research.findById(req.params.id);
  if (!post) {
    discardUploads(req);
    res.status(404);
    throw new Error("Research post not found");
  }
  ["title", "description", "authors"].forEach((key) => {
    if (req.body[key] !== undefined) post[key] = req.body[key];
  });
  if (req.body.hidden !== undefined) post.hidden = req.body.hidden === true || req.body.hidden === "true";
  if (fileOf(req, "image")) {
    const old = post.image?.toObject ? post.image.toObject() : post.image;
    post.image = await uploadFile(fileOf(req, "image"), FOLDER);
    deleteFile(old);
  }
  if (fileOf(req, "pdf") || req.body.removePdf === "true" || req.body.removePdf === true) {
    const old = post.pdf?.toObject ? post.pdf.toObject() : post.pdf;
    post.pdf = fileOf(req, "pdf") ? await uploadFile(fileOf(req, "pdf"), FOLDER) : undefined;
    deleteFile(old);
  }
  res.json({ message: "Research post updated", data: await post.save() });
});

// DELETE /api/research/:id (admin): the post, its picture and its PDF
const remove = asyncHandler(async (req, res) => {
  const post = await Research.findByIdAndDelete(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Research post not found");
  }
  deleteFile(post.image);
  deleteFile(post.pdf);
  res.json({ message: "Research post deleted" });
});

export default { getAll, getAllForAdmin, getById, create, update, remove };
