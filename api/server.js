// import { connectToDatabase } from "../utils/connectToDatabase";
import express from "express";

const app = express();
const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Subscribe to jon dough");
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
