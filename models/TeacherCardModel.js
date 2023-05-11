import mongoose from "mongoose";

const { Schema } = mongoose;

const teacherCardSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  profession: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  description_title: {
    type: String,
    required: true,
  },
  description_parag: {
    type: String,
    required: true,
  },
  image_url: {
    type: String,
    required: true,
  },
  platform_link: {
    type: String,
  },
  subject: {
    type: String,
    required: true,
  },
});

const TeacherCard = mongoose.model("TeachersStaff", teacherCardSchema);

export default TeacherCard;