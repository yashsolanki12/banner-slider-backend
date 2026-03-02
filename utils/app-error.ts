import { StatusCode } from "./status-code.js";

/**
 * Custom error class that supports HTTP status codes
 * Use this to throw errors with specific status codes from anywhere in your code
 *
 * @example
 * // Throw a bad request error
 * throw new AppError("Invalid input", StatusCode.BAD_REQUEST);
 *
 * @example
 * // Throw a not found error
 * throw new AppError("Resource not found", StatusCode.NOT_FOUND);
 */
export class AppError extends Error {
  status: StatusCode;

  constructor(
    message: string,
    status: StatusCode = StatusCode.INTERNAL_SERVER_ERROR,
  ) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;

    // Maintains proper stack trace for where error was thrown (V8 engines)
    Error.captureStackTrace(this, this.constructor);
  }
}
