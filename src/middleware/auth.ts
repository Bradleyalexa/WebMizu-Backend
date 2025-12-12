import jwt from 'jsonwebtoken'
import { Response, NextFunction } from 'express'
import { supabase } from '../config/database'
import { AuthRequest, AuthUser, JwtPayload } from '../types/auth'
import { config } from '../config/environment'
import { ApiResponse } from '../types/api'

export const authMiddleware = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        data: null,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required'
        }
      })
    }

    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({
        success: false,
        data: null,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication token required'
        }
      })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload

    // Get user from database
    const { data: user, error } = await supabase
      .from('profiles')
      .select('id, email, role, name')
      .eq('id', decoded.userId)
      .single()

    if (error || !user) {
      return res.status(401).json({
        success: false,
        data: null,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token'
        }
      })
    }

    req.user = user as AuthUser
    next()
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        data: null,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token'
        }
      })
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        data: null,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Authentication token expired'
        }
      })
    }

    return res.status(401).json({
      success: false,
      data: null,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication error'
      }
    })
  }
}

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        data: null,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required'
        }
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        data: null,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions'
        }
      })
    }

    next()
  }
}

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next() // No auth header, continue without user
    }

    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return next() // No token, continue without user
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload

    // Get user from database
    const { data: user, error } = await supabase
      .from('profiles')
      .select('id, email, role, name')
      .eq('id', decoded.userId)
      .single()

    if (!error && user) {
      req.user = user as AuthUser
    }

    next()
  } catch (error) {
    // Silent fail for optional auth
    next()
  }
}