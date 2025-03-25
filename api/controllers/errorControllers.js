import AppError from "../utils/appError.js";

const sendErrorDev = (err, res) => {
  console.error("ERROR 💥", err);

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something Went Wrong!!!",
    });
  }
};

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const keyValue = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `${keyValue} already exists!`;
  console.log(message);
  return new AppError(message, 409); // Return the AppError object
};

const handleJWTError = () =>
  new AppError("Invalid Token, Please Login Again", 401);

const handleJWTExpiredError = () =>
  new AppError("Your Token Got Expired, Please Login Again", 401);

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Data Input. ${errors.join(".")}`;
  console.log(message);
  const appError = new AppError(message, 409);
  appError.code = err.code; // Copy the code property
  return appError;
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
    console.log("err.name", err.name);
  } else if (process.env.NODE_ENV === "production") {
    let error = Object.assign({}, err);
    error.message = err.message;
    error.name = err.name;
    error.statusCode = err.statusCode || 500;
    error.status = err.status || "error";
    console.log("err.code", error.name);

    if (error.name === "CastError") error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError") error = handleValidationError(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, res);
    console.log("err.name", error.name);
  }
  next();
};

export default globalErrorHandler;
