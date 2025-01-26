import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "../apiContext/app";
import app from "../apiContext/app";

// Initialize dotenv in development mode
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: "./config.env" });
}

const app = app;

// Replace <PASSWORD> dynamically in the connection string
const DB = process.env.DATABASE;

// console;

// // Connect to MongoDB
mongoose
  .connect(DB, {})
  .then(() => console.log("DB connection successful"))
  .catch((err) => console.error("DB connection failed:", err));

// Basic route
app.get("/", (req, res) => {
  res.send("Subscribe to jon dough");
});

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
