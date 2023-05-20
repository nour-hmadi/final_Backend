import mongoose from "mongoose";

const workhrsSchema = mongoose.Schema({

  from_day: {
    type: String,
  required: true
  },
  to_day: {
    type: String,
    required: true,
  },
  from_hour:{
    type: String,
    required: true,
  },
  to_hour: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    
  }
  
},
{
  collection: "workinghours",
  timestamps: true,
});

const Workhrs = mongoose.model("workinghours", workhrsSchema);
export default Workhrs;
