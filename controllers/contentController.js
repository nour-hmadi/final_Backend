import asyncHandler from "express-async-handler";
import Content from "../models/contentModel.js";
import Settings from "../models/settingsModel.js";
import { uploadFile, deleteFile, discardUploads } from "../utils/files.js";

// The fields each list allows. "!" means required; "list" is several lines of text (one item per line).
export const KINDS = {
  program: { name: "text!", level: "text!", years: "number", credits: "number", language: "text",
             summary: "text", learn: "list", careers: "list" },
  course: { year: "number!", semester: "number!", code: "text!", name: "text!", credits: "number", description: "text" },
  calendar: { semester: "text!", label: "text!", dates: "text!" },
  requirement: { text: "text!", appliesTo: "text!" },
  step: { title: "text!", text: "text!" },
  fee: { program: "text!", fee: "text!" },
};

// The single texts the admin can change
export const SETTINGS = {
  heroLead: "text", studentsCount: "text", aboutDepartment: "text", aboutCommunity: "text",
  phone: "text", email: "text", address: "text", officeHours: "text",
  instagram: "text", facebook: "text", youtube: "text", linkedin: "text", examRules: "list",
};

const fail = (res, status, message) => {
  res.status(status);
  throw new Error(message);
};

// Keeps only the allowed fields, turns numbers and lists into the right type, and checks required fields
const clean = (spec, body, before = {}) => {
  const data = { ...before };
  Object.entries(spec).forEach(([key, type]) => {
    if (body[key] === undefined) return;
    const raw = body[key];
    if (type.startsWith("number")) data[key] = raw === "" || raw === null ? null : Number(raw);
    else if (type === "list") data[key] = (Array.isArray(raw) ? raw : String(raw).split("\n")).map((line) => String(line).trim()).filter(Boolean);
    else data[key] = String(raw).trim();
  });
  const missing = Object.entries(spec).find(([key, type]) => type.endsWith("!")
    && (data[key] === undefined || data[key] === null || data[key] === "" || Number.isNaN(data[key])));
  return { data, missing: missing?.[0] };
};

const kindOf = (req, res) => {
  if (!KINDS[req.params.kind]) {
    discardUploads(req);
    fail(res, 404, "Unknown list");
  }
  return req.params.kind;
};

const sorted = (filter) => Content.find(filter).sort({ order: 1, createdAt: 1 });

// GET /api/content (public): every list and the settings, in one request
const getEverything = asyncHandler(async (req, res) => {
  const [items, settings] = await Promise.all([sorted({}), Settings.findOne({ key: "site" })]);
  const lists = Object.fromEntries(Object.keys(KINDS).map((kind) => [kind, []]));
  items.forEach((item) => lists[item.kind]?.push(item));
  res.json({ lists, settings: settings?.data || {} });
});

// GET /api/content/:kind (public)
const getList = asyncHandler(async (req, res) => {
  res.json({ data: await sorted({ kind: kindOf(req, res) }) });
});

// POST /api/content/:kind (admin), with an optional PDF
const create = asyncHandler(async (req, res) => {
  const kind = kindOf(req, res);
  const { data, missing } = clean(KINDS[kind], req.body);
  if (missing) {
    discardUploads(req);
    fail(res, 400, `Please fill in "${missing}"`);
  }
  const item = new Content({ kind, data, order: Number(req.body.order) || 0 });
  if (req.files?.pdf?.[0]) item.pdf = await uploadFile(req.files.pdf[0], `mathdep/${kind}`);
  res.status(201).json({ message: "Added", data: await item.save() });
});

// PUT /api/content/:kind/:id (admin). removePdf=true removes the PDF.
const update = asyncHandler(async (req, res) => {
  const kind = kindOf(req, res);
  const item = await Content.findOne({ _id: req.params.id, kind });
  if (!item) {
    discardUploads(req);
    fail(res, 404, "Not found");
  }
  const { data, missing } = clean(KINDS[kind], req.body, item.data);
  if (missing) {
    discardUploads(req);
    fail(res, 400, `Please fill in "${missing}"`);
  }
  item.data = data;
  item.markModified("data");
  if (req.body.order !== undefined) item.order = Number(req.body.order) || 0;
  if (req.files?.pdf?.[0] || req.body.removePdf === "true") {
    const old = item.pdf?.toObject ? item.pdf.toObject() : item.pdf;
    item.pdf = req.files?.pdf?.[0] ? await uploadFile(req.files.pdf[0], `mathdep/${kind}`) : undefined;
    deleteFile(old);
  }
  res.json({ message: "Saved", data: await item.save() });
});

// DELETE /api/content/:kind/:id (admin)
const remove = asyncHandler(async (req, res) => {
  const kind = kindOf(req, res);
  const item = await Content.findOneAndDelete({ _id: req.params.id, kind });
  if (!item) fail(res, 404, "Not found");
  deleteFile(item.pdf);
  res.json({ message: "Deleted" });
});

// GET /api/content/settings (public) and PUT /api/content/settings (admin)
const getSettings = asyncHandler(async (req, res) => {
  res.json({ data: (await Settings.findOne({ key: "site" }))?.data || {} });
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = (await Settings.findOne({ key: "site" })) || new Settings({ key: "site" });
  settings.data = clean(SETTINGS, req.body, settings.data).data;
  settings.markModified("data");
  await settings.save();
  res.json({ message: "Saved", data: settings.data });
});

export default { getEverything, getList, create, update, remove, getSettings, updateSettings };
