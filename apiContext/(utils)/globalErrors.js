import { Request, Response, NextFunction } from "express";
import AppError from "./appError.js";

export const globalErrorHandler = (err, req, res, next) => {
  // Check if the error is an operational error
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Log the error for developers
    console.error("UNEXPECTED ERROR:", err);

    // Generic message for unexpected errors
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};
