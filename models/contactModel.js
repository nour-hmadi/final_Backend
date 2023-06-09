import mongoose from "mongoose";
const { Schema, model } = mongoose;

const contactUsDetailsSchema = new Schema(
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
    collection: "contactdetails",
    timestamps: true,
  }
);

const ContactUsDetails = model("contactdetails", contactUsDetailsSchema);
export default ContactUsDetails;
