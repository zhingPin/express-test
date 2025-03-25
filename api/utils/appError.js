class AppError extends Error {
  statusCode;
  status;
  isOperational;
  code;

  constructor(message, statusCode = 500, code) {
    super(message); // Call the parent class constructor
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.code = code; // Set the code property
    // Captures the stack trace, omitting constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      message: this.message,
      statusCode: this.statusCode,
      status: this.status,
      isOperational: this.isOperational,
      code: this.code, // Include the code property
    };
  }
}

export default AppError;
