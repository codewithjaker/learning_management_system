import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/errors";
import { ZodError } from "zod";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      //   errors: err.errors,
      errors: err.issues,
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  return res.status(500).json({ message: "Internal server error" });
};
