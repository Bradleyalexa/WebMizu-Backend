"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const customerService_1 = require("../services/customerService");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
// Validation schemas
const createCustomerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    phone: zod_1.z.string().min(10, 'Phone number must be at least 10 characters'),
    address: zod_1.z.string().optional(),
    address_type: zod_1.z.enum(['apartment', 'rumah', 'company']).optional()
});
const updateCustomerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').optional(),
    phone: zod_1.z.string().min(10, 'Phone number must be at least 10 characters').optional(),
    address: zod_1.z.string().optional(),
    address_type: zod_1.z.enum(['apartment', 'rumah', 'company']).optional()
});
const listQuerySchema = zod_1.z.object({
    q: zod_1.z.string().optional(),
    limit: zod_1.z.string().transform(Number).default('20'),
    offset: zod_1.z.string().transform(Number).default('0')
});
const uuidParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid customer ID format')
});
// GET /api/v1/customers (Admin only)
router.get('/', auth_1.authMiddleware, (0, auth_1.requireRole)(['admin']), (0, validation_1.validateQuery)(listQuerySchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { q: search, limit, offset } = req.query;
    const result = await customerService_1.customerService.list({
        search,
        limit,
        offset
    });
    res.json({
        success: true,
        data: result,
        error: null
    });
}));
// GET /api/v1/customers/:id (Admin only)
router.get('/:id', auth_1.authMiddleware, (0, auth_1.requireRole)(['admin']), validateParams(uuidParamSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const customer = await customerService_1.customerService.getById(id);
    res.json({
        success: true,
        data: customer,
        error: null
    });
}));
// GET /api/v1/customers/:id/full (Admin only)
router.get('/:id/full', auth_1.authMiddleware, (0, auth_1.requireRole)(['admin']), validateParams(uuidParamSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const customer = await customerService_1.customerService.getFullProfile(id);
    res.json({
        success: true,
        data: customer,
        error: null
    });
}));
// POST /api/v1/customers (Admin only)
router.post('/', auth_1.authMiddleware, (0, auth_1.requireRole)(['admin']), (0, validation_1.validateRequest)(createCustomerSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const customerData = req.body;
    const customer = await customerService_1.customerService.create(customerData);
    res.status(201).json({
        success: true,
        data: customer,
        error: null
    });
}));
// PATCH /api/v1/customers/:id (Admin only)
router.patch('/:id', auth_1.authMiddleware, (0, auth_1.requireRole)(['admin']), validateParams(uuidParamSchema), (0, validation_1.validateRequest)(updateCustomerSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const customer = await customerService_1.customerService.update(id, updateData);
    res.json({
        success: true,
        data: customer,
        error: null
    });
}));
// DELETE /api/v1/customers/:id (Admin only)
router.delete('/:id', auth_1.authMiddleware, (0, auth_1.requireRole)(['admin']), validateParams(uuidParamSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await customerService_1.customerService.delete(id);
    res.json({
        success: true,
        data: { message: 'Customer deleted successfully' },
        error: null
    });
}));
exports.default = router;
//# sourceMappingURL=customers.js.map