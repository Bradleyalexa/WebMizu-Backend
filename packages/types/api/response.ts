export interface ApiError {
    code: string;
    message: string;
    details?: any;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    error?: ApiError;
}

export interface ErrorResponse {
    success: false;
    data: null;
    error: ApiError;
}

export interface SuccessResponse<T> {
    success: true;
    data: T;
    error?: null;
}
