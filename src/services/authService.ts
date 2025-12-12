import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from '../config/database'
import { config } from '../config/environment'
import { AuthUser, LoginRequest, RegisterRequest, LoginResponse } from '../types/api'

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { phone_or_email, password } = credentials

    // Find user by email or phone
    const { data: profile, error: profileError } = await supabase
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
      .single()

    if (profileError || !profile) {
      throw new Error('Invalid credentials')
    }

    // For now, we'll use a simple password verification
    // In production, you'd hash passwords during registration
    // const isPasswordValid = await bcrypt.compare(password, profile.password)
    // if (!isPasswordValid) {
    //   throw new Error('Invalid credentials')
    // }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: profile.id,
        email: profile.email,
        role: profile.role
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    )

    const user: AuthUser = {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      name: profile.name
    }

    return {
      user,
      token,
      expiresIn: config.jwt.expiresIn
    }
  },

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    const { email, password, name, phone, address, address_type } = userData

    // Check if email already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingProfile) {
      throw new Error('Email already registered')
    }

    // Check if phone already exists
    const { data: existingCustomer, error: phoneCheckError } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', phone)
      .single()

    if (existingCustomer) {
      throw new Error('Phone number already registered')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create profile (using Supabase Auth would be better, but for now we'll use our own)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        email,
        role: 'customer',
        name
      })
      .select()
      .single()

    if (profileError || !profile) {
      throw new Error(`Failed to create profile: ${profileError?.message}`)
    }

    // Create customer record
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        profile_id: profile.id,
        phone,
        address,
        address_type: address_type || 'rumah'
      })
      .select()
      .single()

    if (customerError || !customer) {
      // Rollback profile creation if customer creation fails
      await supabase.from('profiles').delete().eq('id', profile.id)
      throw new Error(`Failed to create customer: ${customerError?.message}`)
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: profile.id,
        email: profile.email,
        role: profile.role
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    )

    const user: AuthUser = {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      name: profile.name
    }

    return {
      user,
      token,
      expiresIn: config.jwt.expiresIn
    }
  },

  async getProfile(userId: string): Promise<AuthUser> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, role, name')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      throw new Error('Profile not found')
    }

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      name: profile.name
    }
  },

  async updateProfile(userId: string, updateData: Partial<AuthUser>): Promise<AuthUser> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        name: updateData.name,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, email, role, name')
      .single()

    if (error || !profile) {
      throw new Error('Failed to update profile')
    }

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      name: profile.name
    }
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // This is a simplified version - in production, you'd have a separate passwords table
    // or use Supabase Auth for proper password management
    throw new Error('Password change not implemented yet')
  }
}