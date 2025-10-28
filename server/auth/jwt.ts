import jwt from 'jsonwebtoken';
import type { User } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';

export interface JWTPayload {
  userId: string;
  username: string;
  email?: string;
}

/**
 * Generate access token (short-lived, 1 hour)
 */
export function generateAccessToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    email: user.email || undefined,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1h', // Short-lived for security
  });
}

/**
 * Generate refresh token (long-lived, 7 days)
 */
export function generateRefreshToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    email: user.email || undefined,
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: '7d', // Long-lived for convenience
  });
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Cookie options for secure token storage
 */
export const ACCESS_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
  path: '/',
};

export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  path: '/',
};
