import mongoose from "mongoose";

// An email address signed up for the newsletter in the footer. Each address appears once.
const subscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 200 },
  },
  { collection: "subscribers", timestamps: true }
);

const Subscriber = mongoose.model("Subscriber", subscriberSchema);

export default Subscriber;
