import mongoose from "mongoose";

const connectToDatabase = async () => {
  const DB = process.env.DATABASE;
  if (!DB) {
    throw new Error(
      "Database connection string is not defined in the environment variables."
    );
  }
  mongoose.connect(DB).then(() => console.log("DB connection successful"));
};
export { connectToDatabase };
