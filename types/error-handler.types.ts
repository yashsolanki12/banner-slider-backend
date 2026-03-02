import { StatusCode } from "../utils/status-code";

export interface AppError extends Error {
  status?: StatusCode;
}