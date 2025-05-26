import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

// Custom error class for specific errors (optional)
export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: unknown, 
  req: Request,
  res: Response,
  next: NextFunction
): Response {
  logger.error(
    "Error occurred",
    err instanceof Error ? err : new Error(String(err))
  );

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  if (err instanceof Error && err.name === "EntityNotFoundError") {
    return res.status(404).json({
      error: "Entity not found",
    });
  }

  return res.status(500).json({
    error: "Internal Server Error",
    details:
      process.env.NODE_ENV === "development"
        ? (err as Error).message
        : undefined,
  });
}
