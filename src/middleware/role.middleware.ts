import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../db/supabase";

export const roleGuard = (requiredRole: "admin" | "customer") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = res.locals.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "User context missing",
          },
        });
      }

      // Check role in profiles table
      // We use supabaseAdmin here because reading roles might require privileged access depending on RLS
      // (Though usually users can read their own profile, explicit admin check is safer done by system)
      const { data: profile, error } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || !profile) {
        return res.status(403).json({
          success: false,
          data: null,
          error: {
            code: "FORBIDDEN",
            message: "Profile not found",
          },
        });
      }

      if (profile.role !== requiredRole) {
        return res.status(403).json({
          success: false,
          data: null,
          error: {
            code: "FORBIDDEN",
            message: `Access required: ${requiredRole}`,
          },
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        data: null,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Role verification failed",
        },
      });
    }
  };
};
