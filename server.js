const express = require("express");
const { connectToDatabase } = require("./utils/connectToDatabase");
const app = express();

const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Subscribe to jon dough");
});

app.listen(port, () => {
  `Server started on port ${port}`;
});
