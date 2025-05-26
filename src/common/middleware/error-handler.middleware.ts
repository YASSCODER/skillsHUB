import { Request, Response, NextFunction } from "express";

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
  err: unknown, // Correct type for error handler
  req: Request,
  res: Response,
  next: NextFunction
): Response {
  // Log the error to the terminal
  console.error(err);

  // If the error is an instance of AppError, use its status and message
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Handle entity not found (example for TypeORM or custom logic)
  if (err instanceof Error && err.name === "EntityNotFoundError") {
    return res.status(404).json({
      error: "Entity not found",
    });
  }

  // Fallback for unhandled errors
  return res.status(500).json({
    error: "Internal Server Error",
    details:
      process.env.NODE_ENV === "development"
        ? (err as Error).message
        : undefined,
  });
}
