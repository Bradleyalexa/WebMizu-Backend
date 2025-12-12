import { AuthUser, LoginRequest, RegisterRequest, LoginResponse } from '../types/api';
export declare const authService: {
    login(credentials: LoginRequest): Promise<LoginResponse>;
    register(userData: RegisterRequest): Promise<LoginResponse>;
    getProfile(userId: string): Promise<AuthUser>;
    updateProfile(userId: string, updateData: Partial<AuthUser>): Promise<AuthUser>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
};
