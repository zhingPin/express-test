import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
// import app from "../apiContext/app";
const app = express();

// Initialize dotenv in development mode
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: "./config.env" });
}

// Replace <PASSWORD> dynamically in the connection string
const DB = process.env.DATABASE;

// Connect to MongoDB
mongoose
  .connect(DB, {})
  .then(() => console.log("DB connection successful"))
  .catch((err) => console.error("DB connection failed:", err));

// Basic route
app.get("/", (req, res) => {
  res.send("Subscribe to jon dough");
});

// Start the server by using the app imported from app.ts
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
