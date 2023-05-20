import mongoose from "mongoose";
const { Schema, model } = mongoose;

const aboutUsSchema = new Schema(
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
    description: {
      type: String,
      required: true,
    },
  },
  {
    collection: "aboutus",
    timestamps: true,
  }
);

const AboutUs = model("aboutus", aboutUsSchema);
export default AboutUs;
