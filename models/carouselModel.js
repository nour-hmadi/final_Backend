import mongoose from "mongoose";
const { Schema, model } = mongoose;

const carouselSchema = new Schema(
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
    },
  },
  {
    collection: "carousel",
    timestamps: true,
  }
);

const Carousel = model("carousel", carouselSchema);

export default Carousel;
