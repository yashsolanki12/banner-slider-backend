import { Request, Response, NextFunction } from "express";
import { StatusCode } from "../utils/status-code.js";
import { ApiResponse } from "../utils/api-response.js";

export const errorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): any => {
  return res
    .status(error.status || StatusCode.INTERNAL_SERVER_ERROR)
    .json(
      new ApiResponse(false, error.message || "Something went wrong", null)
    );
};
