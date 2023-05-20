import mongoose from "mongoose";

const doYouKnowSchema = mongoose.Schema({

  question: {
    type: String,
    default: "Do you know That..."
  },
  description: {
    type: String,
    required: true,
  },
  result:{
    type: String,
    required: true,
  }
  
},
{
  collection: "didyouknow",
  timestamps: true,
});

const DoYouKnow = mongoose.model("didyouknow", doYouKnowSchema);
export default DoYouKnow;
