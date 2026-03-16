import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";
import { ApiResponse } from "../utils/api-response";

export const validate = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        
        // const errors = error.errors.map((err) => ({
        //   field: err.path.join("."),
        //   message: err.message,
        // }));
         const errors = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res
          .status(400)
          .json(ApiResponse.error("Validation failed", errors));
      }
      next(error);
    }
  };
};
