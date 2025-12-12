import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth';
import { ApiResponse } from '../types/api';
export declare const authMiddleware: (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => Promise<Response<ApiResponse<any>, Record<string, any>> | undefined>;
export declare const requireRole: (roles: string[]) => (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => Response<ApiResponse<any>, Record<string, any>> | undefined;
export declare const optionalAuth: (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => Promise<void>;
