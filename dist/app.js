import "dotenv/config";
import hpp from "hpp";
import express from "express";
import { body, validationResult } from "express-validator";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import path from "path";
import { fileURLToPath } from "url";
// ROUTES
import assistantRouter from "./api/aiAssistant/routes/assistantRouter.js";
import threadRouter from "./api/aiAssistant/routes/threadRouter.js";
import messageRouter from "./api/aiAssistant/routes/messageRouter.js";
import chatRouter from "./api/aiAssistant/routes/chatRouter.js";
// ERROR HANDLER
import AppError from "./api/helpers/appError.js";
import { globalErrorHandler } from "./api/helpers/globalErrorHandler.js";
// Get the current file's directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
// ✅ FIX: Trust proxy (for rate limiting to work properly on Vercel)
app.set("trust proxy", 1);
// ✅ Allow frontend origin
app.use(cors());
app.options("*", cors());
app.use(mongoSanitize()); // Prevent NoSQL injection attacks
app.post("/submit", [body("input").trim().escape()], // Use an array for middleware
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return; // Ensure function execution stops here
        }
        res.send("Data is clean");
    });
app.use(hpp({
    whitelist: [],
}));
// Body parser: Limit request payload size
app.use(express.json({ limit: "1000kb" }));
app.use(express.urlencoded({ extended: true })); // Helps with URL-encoded form data
app.use(helmet()); // Secure HTTP headers
// Rate limiting
const limiter = rateLimit({
    max: 100, // Limit each IP to 100 requests per hour
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, please try again in an hour.",
});
app.use("/api", limiter);
// Custom middleware: Example usage
app.use((req, res, next) => {
    req.params.requestTime = new Date().toISOString();
    console.log("Hey i am from middleware function 👋");
    next();
});
// Static file serving
app.use(express.static(path.join(__dirname, "public")));
// Static file serving
app.use(express.static(path.join(__dirname, "public")));
// app.use(morgan("dev")); // Logging middleware
// Development logging
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}
app.get("/docs", (req, res) => {
    res.send("Documentation.");
});
app.use("/api/v1/assistants", assistantRouter);
app.use("/api/v1/thread", threadRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/chat", chatRouter);
// app.use("/api/v1/health-check", healthCheckRouter);
app.get("/", (req, res) => {
    res.send("Welcome my the Express Server!");
});
// Catch-all handler for undefined routes
app.all("*", (req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});
// Global error handler
app.use(globalErrorHandler);
// Export the app
export default app;
