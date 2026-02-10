import { Request, Response, NextFunction } from "express";
import { config } from "../config/config";
import { createClient } from "@supabase/supabase-js";

// We use a clean client just for verifying tokens
const supabaseAuth = createClient(config.supabase.url, config.supabase.anonKey);

export const authGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        data: null,
        error: {
          code: "UNAUTHORIZED",
          message: "No authorization header provided",
        },
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        data: null,
        error: {
          code: "UNAUTHORIZED",
          message: "Bearer token missing",
        },
      });
    }

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        data: null,
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid or expired token",
        },
      });
    }

    // Attach user and token to locals for downstream use
    res.locals.user = user;
    res.locals.accessToken = token;

    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Auth verification failed",
      },
    });
  }
};
