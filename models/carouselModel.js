import mongoose from "mongoose";
const { Schema, model } = mongoose;

const carouselSchema = new Schema(
  {
    image_url: {
      type: String,
      required: true,
    },
  },
  {
    collection: "carousel",
    timestamps: true,
  }
);

const Carousel = model("carousel", carouselSchema);

export default Carousel;
