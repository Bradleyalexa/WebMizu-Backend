import express from 'express'
import { z } from 'zod'
import { customerService } from '../services/customerService'
import { validateRequest, validateQuery, validateParams } from '../middleware/validation'
import { authMiddleware, requireRole } from '../middleware/auth'
import { asyncHandler } from '../middleware/errorHandler'
import { ApiResponse } from '../types/api'

const router = express.Router()

// Validation schemas
const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  address: z.string().optional(),
  address_type: z.enum(['apartment', 'rumah', 'company']).optional()
})

const updateCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 characters').optional(),
  address: z.string().optional(),
  address_type: z.enum(['apartment', 'rumah', 'company']).optional()
})

const listQuerySchema = z.object({
  q: z.string().optional(),
  limit: z.string().transform(Number).default('20'),
  offset: z.string().transform(Number).default('0')
})

const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid customer ID format')
})

// GET /api/v1/customers (Admin only)
router.get('/',
  authMiddleware,
  requireRole(['admin']),
  validateQuery(listQuerySchema),
  asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
    const { q: search, limit, offset } = req.query as any

    const result = await customerService.list({
      search,
      limit,
      offset
    })

    res.json({
      success: true,
      data: result,
      error: null
    })
  })
)

// GET /api/v1/customers/:id (Admin only)
router.get('/:id',
  authMiddleware,
  requireRole(['admin']),
  validateParams(uuidParamSchema),
  asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
    const { id } = req.params

    const customer = await customerService.getById(id)

    res.json({
      success: true,
      data: customer,
      error: null
    })
  })
)

// GET /api/v1/customers/:id/full (Admin only)
router.get('/:id/full',
  authMiddleware,
  requireRole(['admin']),
  validateParams(uuidParamSchema),
  asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
    const { id } = req.params

    const customer = await customerService.getFullProfile(id)

    res.json({
      success: true,
      data: customer,
      error: null
    })
  })
)

// POST /api/v1/customers (Admin only)
router.post('/',
  authMiddleware,
  requireRole(['admin']),
  validateRequest(createCustomerSchema),
  asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
    const customerData = req.body

    const customer = await customerService.create(customerData)

    res.status(201).json({
      success: true,
      data: customer,
      error: null
    })
  })
)

// PATCH /api/v1/customers/:id (Admin only)
router.patch('/:id',
  authMiddleware,
  requireRole(['admin']),
  validateParams(uuidParamSchema),
  validateRequest(updateCustomerSchema),
  asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
    const { id } = req.params
    const updateData = req.body

    const customer = await customerService.update(id, updateData)

    res.json({
      success: true,
      data: customer,
      error: null
    })
  })
)

// DELETE /api/v1/customers/:id (Admin only)
router.delete('/:id',
  authMiddleware,
  requireRole(['admin']),
  validateParams(uuidParamSchema),
  asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
    const { id } = req.params

    await customerService.delete(id)

    res.json({
      success: true,
      data: { message: 'Customer deleted successfully' },
      error: null
    })
  })
)

export default router