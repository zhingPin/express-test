import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss";
import { body, validationResult } from "express-validator";

const app = express();

app.use(cors());
app.options("*", cors());
app.use(mongoSanitize()); // Prevent NoSQL injection attacks
app.post(
  "/submit",
  body("input").trim().escape(), // Automatically removes XSS risks
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    res.send("Data is clean");
  }
);
// Body parser: Limit request payload size
app.use(express.json({ limit: "100kb" }));

app.use(helmet()); // Secure HTTP headers

export default app;
