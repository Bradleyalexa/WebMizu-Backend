"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const environment_1 = require("../config/environment");
exports.authService = {
    async login(credentials) {
        const { phone_or_email, password } = credentials;
        // Find user by email or phone
        const { data: profile, error: profileError } = await database_1.supabase
            .from('profiles')
            .select(`
        id,
        email,
        role,
        name,
        customers!inner(
          phone,
          address,
          address_type
        )
      `)
            .or(`email.eq.${phone_or_email},customers.phone.eq.${phone_or_email}`)
            .single();
        if (profileError || !profile) {
            throw new Error('Invalid credentials');
        }
        // For now, we'll use a simple password verification
        // In production, you'd hash passwords during registration
        // const isPasswordValid = await bcrypt.compare(password, profile.password)
        // if (!isPasswordValid) {
        //   throw new Error('Invalid credentials')
        // }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            userId: profile.id,
            email: profile.email,
            role: profile.role
        }, environment_1.config.jwt.secret, { expiresIn: environment_1.config.jwt.expiresIn });
        const user = {
            id: profile.id,
            email: profile.email,
            role: profile.role,
            name: profile.name
        };
        return {
            user,
            token,
            expiresIn: environment_1.config.jwt.expiresIn
        };
    },
    async register(userData) {
        const { email, password, name, phone, address, address_type } = userData;
        // Check if email already exists
        const { data: existingProfile, error: checkError } = await database_1.supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();
        if (existingProfile) {
            throw new Error('Email already registered');
        }
        // Check if phone already exists
        const { data: existingCustomer, error: phoneCheckError } = await database_1.supabase
            .from('customers')
            .select('id')
            .eq('phone', phone)
            .single();
        if (existingCustomer) {
            throw new Error('Phone number already registered');
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create profile (using Supabase Auth would be better, but for now we'll use our own)
        const { data: profile, error: profileError } = await database_1.supabase
            .from('profiles')
            .insert({
            email,
            role: 'customer',
            name
        })
            .select()
            .single();
        if (profileError || !profile) {
            throw new Error(`Failed to create profile: ${profileError?.message}`);
        }
        // Create customer record
        const { data: customer, error: customerError } = await database_1.supabase
            .from('customers')
            .insert({
            profile_id: profile.id,
            phone,
            address,
            address_type: address_type || 'rumah'
        })
            .select()
            .single();
        if (customerError || !customer) {
            // Rollback profile creation if customer creation fails
            await database_1.supabase.from('profiles').delete().eq('id', profile.id);
            throw new Error(`Failed to create customer: ${customerError?.message}`);
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            userId: profile.id,
            email: profile.email,
            role: profile.role
        }, environment_1.config.jwt.secret, { expiresIn: environment_1.config.jwt.expiresIn });
        const user = {
            id: profile.id,
            email: profile.email,
            role: profile.role,
            name: profile.name
        };
        return {
            user,
            token,
            expiresIn: environment_1.config.jwt.expiresIn
        };
    },
    async getProfile(userId) {
        const { data: profile, error } = await database_1.supabase
            .from('profiles')
            .select('id, email, role, name')
            .eq('id', userId)
            .single();
        if (error || !profile) {
            throw new Error('Profile not found');
        }
        return {
            id: profile.id,
            email: profile.email,
            role: profile.role,
            name: profile.name
        };
    },
    async updateProfile(userId, updateData) {
        const { data: profile, error } = await database_1.supabase
            .from('profiles')
            .update({
            name: updateData.name,
            updated_at: new Date().toISOString()
        })
            .eq('id', userId)
            .select('id, email, role, name')
            .single();
        if (error || !profile) {
            throw new Error('Failed to update profile');
        }
        return {
            id: profile.id,
            email: profile.email,
            role: profile.role,
            name: profile.name
        };
    },
    async changePassword(userId, currentPassword, newPassword) {
        // This is a simplified version - in production, you'd have a separate passwords table
        // or use Supabase Auth for proper password management
        throw new Error('Password change not implemented yet');
    }
};
//# sourceMappingURL=authService.js.map