import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    file_number: {
      type: Number,
      required: [true, "please add your file number"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    description: {
      type: String,
    },
    title: {
      type: String,
    },
    phone_number: {
      type: Number,
      required: [true, "please add your file number"],
    },

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
    status: {
      type: Boolean,
      default: 1,
    },

    role: {
      type: Boolean,
      default: 0,
    },

    teacher_courses: [
      {
        course_name: {
          type: Schema.Types.ObjectId,
          ref:"courses",
        },
        pdf: {
          public_id: {
            type: String,
           
          },
          url: {
            type: String,
          
          },
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
