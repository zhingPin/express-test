import express from "express";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

const app = express();
// // Development logging
// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }

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

app.use(
  hpp({
    whitelist: [],
  })
);
// Body parser: Limit request payload size
app.use(express.json({ limit: "100kb" }));

app.use(helmet()); // Secure HTTP headers

// Rate limiting
const limiter = rateLimit({
  max: 100, // Limit each IP to 100 requests per hour
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour.",
});
app.use("/api", limiter);

export default app;
