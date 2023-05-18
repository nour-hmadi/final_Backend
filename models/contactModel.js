import mongoose from "mongoose";

const contactUsDetailsSchema = mongoose.Schema({
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
});

const ContactUsDetails = mongoose.model(
  "ContactUsDetails",
  contactUsDetailsSchema
);
export default ContactUsDetails;
