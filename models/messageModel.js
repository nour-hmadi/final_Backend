import mongoose from "mongoose";

// A message sent from the Contact page. The admin reads it in the dashboard and replies by email.
const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 100 },
    email: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 5000 },
    read: { type: Boolean, default: false },
  },
  { collection: "messages", timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
