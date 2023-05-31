import mongoose from "mongoose";

const AnnouncementSchema = mongoose.Schema(
  {
  
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    day:{
      type: String,
      required: true,
    },
    month:{
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      //event-announcement
    },
  },
  {
    collection: "Announcement",
    timestamps: true,
  }
);

const Announcement = mongoose.model("Announcement", AnnouncementSchema);
export default Announcement;
