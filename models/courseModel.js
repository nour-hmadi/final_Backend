import mongoose from "mongoose";

const { Schema } = mongoose;

const courseSchema = new Schema({
  course_name: {
    type: String,
    required: true,
  },
  course_code: {
    type: String,
    required: true,
  },
  syllabus: {
    type: String,
    required: true,
  },
  
});

const courseModel = mongoose.model("courses", courseSchema);

export default courseModel;
