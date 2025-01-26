import express from "express";
import { connectToDatabase } from "./utils/connectToDatabase";

const app = express();
const port = process.env.PORT || 8080;

// Connect to the database
connectToDatabase();

app.get("/", (req, res) => {
  res.send("Subscribe to jon dough");
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
