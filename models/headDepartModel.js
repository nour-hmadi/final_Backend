import mongoose from "mongoose";
const headDepartSchema = mongoose.Schema({
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
  name: {
    type: String,
    default: "Do you know That..."
  },
  email:{
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

  
},
{
  collection: "headDepartment",
  timestamps: true,
});

const HeadDepart = mongoose.model("headDepartment", headDepartSchema);
export default HeadDepart;
