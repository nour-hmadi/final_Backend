
import mongoose from "mongoose";

const { Schema } = mongoose;

const courseSyllabusSchema = new Schema({
  course_name: {
    type: String,
    required: true,
   
  },
  course_code: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  credits: {
    type: Number,
    required: true,
  },
  sem: {
    type: String,
    required: true,
  },
  cm: {
    type: String,
    required: true,
  },
  td: {
    type: String,
    required: true,
  },
  tp: {
    type: String,
    required: true,
  },
  hrs: {
    type: String,
    required: true,
  },
  
},
{
  collection: "coursesyllabus",
  timestamps: true,
});

const courseModel = mongoose.model("coursesyllabus", courseSyllabusSchema);

export default courseModel;
