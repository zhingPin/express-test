const express = require("express");
const { connectToDatabase } = require("./utils/connectToDatabase");
const app = express();

const port = process.env.PORT || 8080;

(async () => {
  try {
    await connectToDatabase();
    console.log("Connected to MongoDB");
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    console.error("Failed to connect to MongoDB:", errorMessage);
    process.exit(1); // Exit process if DB connection fails
  }
})();

app.get("/", (req, res) => {
  res.send("Subscribe to jon dough");
});
// connectToDatabase();

app.listen(port, () => {
  `Server started on port ${port}`;
});
