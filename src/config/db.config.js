import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(
        process.env.MONGO_URL,
    );
    console.log(
      `MongoDB connection is stablished ${connection.connection.host}`,
    );
  } catch (error) {
    console.error("Error connecting with MongoDB");
    process.exit(1);
  }
};

export default connectDB;
