import { Request, Response, NextFunction } from "express";
import { StatusCode } from "../utils/status-code.js";
import { ApiResponse } from "../utils/api-response.js";
import { AppError } from "../types/error-handler.types.js";

export const errorHandler = (
  error: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): any => {
  console.error("❌ Error caught by errorHandler:", error.message);

  const status = error.status || StatusCode.INTERNAL_SERVER_ERROR;
  const message = error.message || "Something went wrong";

  return res.status(status).json(new ApiResponse(false, message, null));
};
