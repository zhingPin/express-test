import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

const app = express();

app.use(cors());
app.options("*", cors());
app.use(mongoSanitize()); // Prevent NoSQL injection attacks

// Body parser: Limit request payload size
app.use(express.json({ limit: "100kb" }));

app.use(helmet()); // Secure HTTP headers

export default app;
