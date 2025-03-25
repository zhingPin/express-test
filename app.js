import express from "express";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import AppError from "./api/utils/appError.js"; // Ensure correct relative path & file extension
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

// // Router imports with explicit file extensions
import userRouter from "./api/routers/userRouter.js";
import nftRouter from "./api/routers/nftRouter.js";
import globalErrorHandler from "./api/controllers/errorControllers.js";
import assistantRouter from "./api/routers/assistantRouter.js";
// import threadRouter from "./api/routers/threadRouter.js";
// import messageRouter from "./api/routers/messageRouter.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Static file serving
app.use(express.static(path.join(__dirname, "public")));
// app.use(morgan("dev")); // Logging middleware
// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// Custom middleware: Example usage
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log("Hey i am from middleware function 👋");
  next();
});

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/nfts", nftRouter);
app.use("/api/v1/assistants", assistantRouter);
// app.use("/api/v1/thread", threadRouter);
// app.use("/api/v1/message", messageRouter);

app.get("/", (req, res) => {
  res.send("Welcome my the Express Server!");
});

// Catch-all handler for undefined routes
app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
