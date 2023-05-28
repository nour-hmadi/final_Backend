import mongoose from "mongoose";
const researchSchema = mongoose.Schema(
  {
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
  },
  {
    collection: "Research",
    timestamps: true,
  }
);

const ResearchModel = mongoose.model("Research", researchSchema);
export default ResearchModel;
