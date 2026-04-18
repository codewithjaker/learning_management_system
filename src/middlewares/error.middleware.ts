import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/api-response";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Error:", error);

  // Handle Zod validation errors
  if (error.name === "ZodError") {
    return res.status(400).json(ApiResponse.error("Validation failed"));
  }

  // Handle database errors
  if (error.name === "DatabaseError") {
    return res.status(500).json(ApiResponse.error("Database error occurred"));
  }

  // Default error
  res.status(500).json(ApiResponse.error("Internal server error"));
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json(ApiResponse.error("Route not found"));
};
