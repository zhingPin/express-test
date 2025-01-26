const AppError = require("../Utils/appError");

const sendErrorDev = (err, res) => {
  console.log(err);
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorPro = (err, res) => {
  if (err.isOperational) {
    console.log("proErr", err, "err.message,", err.message);

    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: err.message || "Something Went Wrong!!!", // Use the error message if available, otherwise use a generic message
    });
  }
};

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  // console.log("castErr", err.statusCode); // This may not be necessary

  return new AppError(message, 400); // Set statusCode directly in the AppError constructor
};

const handleDuplicateFieldsBD = (err) => {
  if (err.errmsg) {
    const keyValue = err.errmsg.match(/['"]([^'"]+)['"]/)[1];
    const message = ` ${keyValue} already exists!`;
    return new AppError(message, 409); // Set statusCode directly in the AppError constructor
  }
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invald Data: ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError("Please sign in", 401);

const handleJWTExpiredError = () =>
  new AppError("session expired, Please Login", 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  console.log("Error caught by global error handler"); // Log the error object

  if (process.env.NODE_ENV === "development") {
    console.log("Handling error in development mode", err);
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    console.log("Handling error in production mode");

    let error = { ...err };
    if (err.name === "CastError") {
      error = handleCastError(err);
    } else if (error.code === 11000) {
      error = handleDuplicateFieldsBD(err);
    } else if (err.name === "ValidationError") {
      error = handleValidationError(err);
    } else if (error.name === "JsonWebTokenError") {
      error = handleJWTError();
    } else if (err.name === "TokenExpiredError") {
      error = handleJWTExpiredError();
    }

    // console.log("Final error being sent to client:"); // Log the final error object being sent to the client

    if (error.message) {
      sendErrorPro(error, res);
    } else if (err.message) {
      sendErrorPro(err, res);
    }
  }
  next();
};
