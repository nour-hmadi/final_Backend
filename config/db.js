
import mongoose from "mongoose";
import colors from "colors";
import cloudinary from "cloudinary";

const connectDB = async () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });
    console.log("✅ Cloudinary configured successfully".green);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.error(`❌ Error connecting to the database: ${error.message}`.red.bold);
    process.exit(1);
  }
};

export default connectDB;
