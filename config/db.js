// import mongoose from "mongoose";

// const connectDB = async () => {
//     try {
//         mongoose.set('strictQuery', false);
//         const conn = await mongoose.connect(process.env.MONGO_URL, {
//             useUnifiedTopology: true,
//             dbName: process.env.DB_NAME
//         })

//         console.log(`Connected Successfuly to Database :)`);
//     } catch (error) {
//         console.log(`Error: ${error.message}`)
//         process.exit();
//     }
// }
import mongoose from "mongoose";
import colors from "colors";

const connectDB = async () => {
  try {
    console.log(process.env.MONGO_URI);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default connectDB;


