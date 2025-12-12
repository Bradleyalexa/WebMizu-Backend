import { Request, Response, NextFunction } from 'express'
import { ApiResponse } from '../types/api'

export const errorHandler = (
  error: any,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  console.error('Error:', error)

  // Handle specific error types
  if (error.code === '23505') { // Unique constraint violation
    return res.status(409).json({
      success: false,
      data: null,
      error: {
        code: 'CONFLICT',
        message: 'Resource already exists',
        details: error.detail
      }
    })
  }

  if (error.code === '23503') { // Foreign key violation
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'FOREIGN_KEY_VIOLATION',
        message: 'Referenced resource does not exist',
        details: error.detail
      }
    })
  }

  if (error.code === '23514') { // Check constraint violation
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'CONSTRAINT_VIOLATION',
        message: 'Data constraint violation',
        details: error.detail
      }
    })
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.errors
      }
    })
  }

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

  if (error.message && error.message.includes('Supabase')) {
    return res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Database operation failed',
        details: error.message
      }
    })
  }

  // Default error response
  const statusCode = error.statusCode || error.status || 500
  const message = error.message || 'An unexpected error occurred'

  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: message,
      ...(process.env['NODE_ENV'] === 'development' && { stack: error.stack })
    }
  })
}

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}