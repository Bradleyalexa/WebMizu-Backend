"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const authService_1 = require("../services/authService");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
// Validation schemas
const loginSchema = zod_1.z.object({
    phone_or_email: zod_1.z.string().min(1, 'Email or phone is required'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters')
});
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    phone: zod_1.z.string().min(10, 'Phone number must be at least 10 characters'),
    address: zod_1.z.string().optional(),
    address_type: zod_1.z.enum(['apartment', 'rumah', 'company']).optional()
});
const updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: zod_1.z.string().email('Invalid email format').optional()
});
const changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(6, 'Current password is required'),
    newPassword: zod_1.z.string().min(6, 'New password must be at least 6 characters')
});
// POST /api/v1/auth/login
router.post('/login', (0, validation_1.validateRequest)(loginSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const credentials = req.body;
    const result = await authService_1.authService.login(credentials);
    res.json({
        success: true,
        data: result,
        error: null
    });
}));
// POST /api/v1/auth/register
router.post('/register', (0, validation_1.validateRequest)(registerSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userData = req.body;
    const result = await authService_1.authService.register(userData);
    res.status(201).json({
        success: true,
        data: result,
        error: null
    });
}));
// GET /api/v1/auth/me
router.get('/me', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const profile = await authService_1.authService.getProfile(userId);
    res.json({
        success: true,
        data: profile,
        error: null
    });
}));
// PUT /api/v1/auth/profile
router.put('/profile', auth_1.authMiddleware, (0, validation_1.validateRequest)(updateProfileSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const updateData = req.body;
    const profile = await authService_1.authService.updateProfile(userId, updateData);
    res.json({
        success: true,
        data: profile,
        error: null
    });
}));
// POST /api/v1/auth/change-password
router.post('/change-password', auth_1.authMiddleware, (0, validation_1.validateRequest)(changePasswordSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    await authService_1.authService.changePassword(userId, currentPassword, newPassword);
    res.json({
        success: true,
        data: { message: 'Password changed successfully' },
        error: null
    });
}));
// POST /api/v1/auth/logout
router.post('/logout', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // In a stateless JWT setup, logout is typically handled client-side
    // by removing the token from storage
    res.json({
        success: true,
        data: { message: 'Logged out successfully' },
        error: null
    });
}));
// GET /api/v1/auth/verify-token
router.get('/verify-token', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // If we reach here, the token is valid (authMiddleware passed)
    const user = req.user;
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
    });
}));
exports.default = router;
//# sourceMappingURL=auth.js.map