import mongoose from "mongoose";
const { Schema, model } = mongoose;

const gallerySchema = new Schema(
  {
    image: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    title: {
      type: String,
      required: true,
    },

    section: {
      type: String,
      required: true,
    },
  },

  {
    collection: "gallery",
    timestamps: true,
  }
);

const Gallery = model("gallery", gallerySchema);
export default Gallery;
