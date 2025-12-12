import { Request } from 'express'

export interface AuthUser {
  id: string
  email: string
  role: 'admin' | 'customer'
  name: string
}

export interface AuthRequest extends Request {
  user?: AuthUser
}

export interface JwtPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}