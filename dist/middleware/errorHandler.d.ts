import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/api';
export declare const errorHandler: (error: any, req: Request, res: Response<ApiResponse>, next: NextFunction) => Response<ApiResponse<any>, Record<string, any>> | undefined;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
