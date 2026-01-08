import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "../../../packages/types/api/response";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err); // Always log to console/stdout

  const response: ErrorResponse = {
    success: false,
    data: null,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: err.message || "An unexpected error occurred",
      details: process.env.NODE_ENV === "development" ? err : undefined,
    },
  };

  const status = err.status || 500;
  
  res.status(status).json(response);
};
