import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();

app.use(cors());
app.options("*", cors());

// Body parser: Limit request payload size
app.use(express.json({ limit: "100kb" }));

app.use(helmet()); // Secure HTTP headers

export default app;
