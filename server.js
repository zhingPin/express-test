import express from "express";
import "dotenv/config";

import app from "./app.js";
const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Subscribe to gon Nupane's channel");
});

app.listen(port, () => {
  `Server started on port ${port}`;
});
