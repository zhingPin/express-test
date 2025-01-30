class AppError extends Error {
    statusCode;
    status;
    isOperational;
    constructor(message, statusCode = 500) {
        super(message); // Call the parent class constructor
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;
        // Captures the stack trace, omitting constructor call from it
        Error.captureStackTrace(this, this.constructor);
    }
    toJSON() {
        return {
            message: this.message,
            statusCode: this.statusCode,
            status: this.status,
        };
    }
}
export default AppError;
