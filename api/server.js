import express from "express";
// import dotenv from "dotenv";
// import mongoose from "mongoose";
// const express = require("express");s
const app = express();

const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Subscribe to Arpan Neupane's channel");
});

app.listen(port, () => {
  `Server started on port ${port}`;
});
