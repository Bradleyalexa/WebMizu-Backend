"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validateQuery = exports.validateRequest = void 0;
const zod_1 = require("zod");
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Validation failed',
                        details: error.errors.map(err => ({
                            field: err.path.join('.'),
                            message: err.message,
                            code: err.code
                        }))
                    }
                });
            }
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.query);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Query validation failed',
                        details: error.errors.map(err => ({
                            field: err.path.join('.'),
                            message: err.message,
                            code: err.code
                        }))
                    }
                });
            }
            next(error);
        }
    };
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.params);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Parameter validation failed',
                        details: error.errors.map(err => ({
                            field: err.path.join('.'),
                            message: err.message,
                            code: err.code
                        }))
                    }
                });
            }
            next(error);
        }
    };
};
exports.validateParams = validateParams;
//# sourceMappingURL=validation.js.map