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
    authors: { type: String },                       // e.g. "Dr. Maya Haddad and Dr. Karim Saad"
    pdf: {                                           // optional: the full paper
      public_id: { type: String },
      url: { type: String },
      name: { type: String },
      resource_type: { type: String },
    },
    hidden: { type: Boolean, default: false },      // hidden by the admin
  },
  {
    collection: "Research",
    timestamps: true,
  }
);

const ResearchModel = mongoose.model("Research", researchSchema);
export default ResearchModel;
