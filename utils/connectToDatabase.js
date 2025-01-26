import mongoose from "mongoose";

const connectToDatabase = async () => {
  const DB = process.env.DATABASE;

  if (!DB) {
    throw new Error(
      "Database connection string is not defined in the environment variables."
    );
  }

  try {
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB connection successful");
  } catch (err) {
    console.error("DB connection failed:", err);
    throw err; // Re-throw the error to prevent silent failures
  }
};

export { connectToDatabase };
