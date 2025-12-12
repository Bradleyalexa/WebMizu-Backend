import express from 'express'
import { z } from 'zod'
import { authService } from '../services/authService'
import { validateRequest } from '../middleware/validation'
import { authMiddleware } from '../middleware/auth'
import { asyncHandler } from '../middleware/errorHandler'
import { ApiResponse, LoginRequest, RegisterRequest } from '../types/api'

const router = express.Router()

// Validation schemas
const loginSchema = z.object({
  phone_or_email: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  address: z.string().optional(),
  address_type: z.enum(['apartment', 'rumah', 'company']).optional()
})

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email format').optional()
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
})

// POST /api/v1/auth/login
router.post('/login',
  validateRequest(loginSchema),
  asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
    const credentials = req.body as LoginRequest

    const result = await authService.login(credentials)

    res.json({
      success: true,
      data: result,
      error: null
    })
  })
)

// POST /api/v1/auth/register
router.post('/register',
  validateRequest(registerSchema),
  asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
    const userData = req.body as RegisterRequest

    const result = await authService.register(userData)

    res.status(201).json({
      success: true,
      data: result,
      error: null
    })
  })
)

// GET /api/v1/auth/me
router.get('/me',
  authMiddleware,
  asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
    const userId = (req as any).user.id

    const profile = await authService.getProfile(userId)

    res.json({
      success: true,
      data: profile,
      error: null
    })
  })
)

// PUT /api/v1/auth/profile
router.put('/profile',
  authMiddleware,
  validateRequest(updateProfileSchema),
  asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
    const userId = (req as any).user.id
    const updateData = req.body

    const profile = await authService.updateProfile(userId, updateData)

    res.json({
      success: true,
      data: profile,
      error: null
    })
  })
)

// POST /api/v1/auth/change-password
router.post('/change-password',
  authMiddleware,
  validateRequest(changePasswordSchema),
  asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
    const userId = (req as any).user.id
    const { currentPassword, newPassword } = req.body

    await authService.changePassword(userId, currentPassword, newPassword)

    res.json({
      success: true,
      data: { message: 'Password changed successfully' },
      error: null
    })
  })
)

// POST /api/v1/auth/logout
router.post('/logout',
  authMiddleware,
  asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
    // In a stateless JWT setup, logout is typically handled client-side
    // by removing the token from storage
    res.json({
      success: true,
      data: { message: 'Logged out successfully' },
      error: null
    })
  })
)

// GET /api/v1/auth/verify-token
router.get('/verify-token',
  authMiddleware,
  asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
    // If we reach here, the token is valid (authMiddleware passed)
    const user = (req as any).user

    res.json({
      success: true,
      data: {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        }
      },
      error: null
    })
  })
)

export default router