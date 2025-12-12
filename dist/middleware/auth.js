"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireRole = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const environment_1 = require("../config/environment");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                data: null,
                error: {
                    code: 'AUTH_REQUIRED',
                    message: 'Authentication required'
                }
            });
        }
        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                data: null,
                error: {
                    code: 'AUTH_REQUIRED',
                    message: 'Authentication token required'
                }
            });
        }
        // Verify JWT token
        const decoded = jsonwebtoken_1.default.verify(token, environment_1.config.jwt.secret);
        // Get user from database
        const { data: user, error } = await database_1.supabase
            .from('profiles')
            .select('id, email, role, name')
            .eq('id', decoded.userId)
            .single();
        if (error || !user) {
            return res.status(401).json({
                success: false,
                data: null,
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid authentication token'
                }
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                data: null,
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid authentication token'
                }
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                data: null,
                error: {
                    code: 'TOKEN_EXPIRED',
                    message: 'Authentication token expired'
                }
            });
        }
        return res.status(401).json({
            success: false,
            data: null,
            error: {
                code: 'AUTH_ERROR',
                message: 'Authentication error'
            }
        });
    }
};
exports.authMiddleware = authMiddleware;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                data: null,
                error: {
                    code: 'AUTH_REQUIRED',
                    message: 'Authentication required'
                }
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                data: null,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Insufficient permissions'
                }
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
// Optional authentication - doesn't fail if no token provided
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(); // No auth header, continue without user
        }
        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            return next(); // No token, continue without user
        }
        // Verify JWT token
        const decoded = jsonwebtoken_1.default.verify(token, environment_1.config.jwt.secret);
        // Get user from database
        const { data: user, error } = await database_1.supabase
            .from('profiles')
            .select('id, email, role, name')
            .eq('id', decoded.userId)
            .single();
        if (!error && user) {
            req.user = user;
        }
        next();
    }
    catch (error) {
        // Silent fail for optional auth
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map