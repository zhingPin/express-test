import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.options("*", cors());

export default app;
