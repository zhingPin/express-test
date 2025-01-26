//app.ts
import "dotenv/config";
// import { Request, Response, NextFunction } from "express";
// import OpenAI from "openai";

import xssClean from "xss-clean";

import hpp from "hpp";

import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

// Utility imports
import { globalErrorHandler } from "./(utils)/globalErrors.js";
import AppError from "./(utils)/appError.js";

// // Router imports with explicit file extensions
// import assistantRouter from "./src/shared/api/routers/assistantRouter.js";
// import threadRouter from "./src/shared/api/routers/threadRouter.js";
// import messageRouter from "./src/shared/api/routers/messageRouter.js";
import userRouter from "../apiContext/(routers)/userRouter.js";
import nftRouter from "../apiContext/(routers)/nftRouter.js";
import playlistRouter from "../apiContext/(routers)/playlistRouter.js";

const app = express();

// Middleware for CORS
app.use(cors());
app.options("*", cors());

// Body parser: Limit request payload size
app.use(express.json({ limit: "100kb" }));

// Security Middleware
app.use(helmet()); // Secure HTTP headers
app.use(mongoSanitize()); // Prevent NoSQL injection attacks
app.use(xssClean()); // Prevent XSS attacks

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "difficulty",
      "maxGroupSize",
      "price",
      "ratingsAverage",
      "ratingsQuantity",
    ],
  })
);

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// const client = new OpenAI();

// Rate limiting
const limiter = rateLimit({
  max: 100, // Limit each IP to 100 requests per hour
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour.",
});
app.use("/api", limiter);

// Custom middleware: Example usage
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// // Static file serving (if needed)
// app.use(express.static(`${__dirname}/nft-data/img.cjs`));
notify;
// Routes
app.use("/api/v1/nft", nftRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/user", userRouter);

// Catch-all handler for undefined routes
app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// Global error handler
app.use(globalErrorHandler);

// Export the app
export default app;
