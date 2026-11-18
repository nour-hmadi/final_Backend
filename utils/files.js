import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

// Sends an uploaded file to Cloudinary and removes the temporary copy in uploads/.
// Photos are stored as images; PDFs as "raw" files, which Cloudinary serves unchanged.
export const uploadFile = async (file, folder) => {
  const resource_type = file.mimetype === "application/pdf" ? "raw" : "image";
  try {
    const result = await cloudinary.uploader.upload(file.path, { folder, resource_type, use_filename: true });
    return { public_id: result.public_id, url: result.secure_url, name: file.originalname, resource_type };
  } finally {
    fs.promises.unlink(file.path).catch(() => {});
  }
};

// Deletes a file from Cloudinary. Demo files (public_id starting with "demo-") live in the frontend.
export const deleteFile = (stored) => {
  if (stored?.public_id && !stored.public_id.startsWith("demo-")) {
    cloudinary.uploader.destroy(stored.public_id, { resource_type: stored.resource_type || "image" }).catch(() => {});
  }
};

// Removes temporary uploads when a request is refused before they reach Cloudinary
export const discardUploads = (req) => {
  const files = req.file ? [req.file] : Object.values(req.files || {}).flat();
  files.forEach((file) => fs.promises.unlink(file.path).catch(() => {}));
};
