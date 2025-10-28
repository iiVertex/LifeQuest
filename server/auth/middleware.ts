import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type JWTPayload } from './jwt';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware to verify JWT access token from cookies
 */
export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = req.cookies?.accessToken;

  if (!token) {
    res.status(401).json({ 
      message: 'Authentication required. Please log in.' 
    });
    return;
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    res.status(403).json({ 
      message: 'Invalid or expired token. Please log in again.' 
    });
    return;
  }

  // Attach user info to request
  req.user = payload;
  next();
}

/**
 * Optional authentication - attaches user if token exists, but doesn't block
 */
export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = req.cookies?.accessToken;

  if (token) {
    const payload = verifyAccessToken(token);
    if (payload) {
      req.user = payload;
    }
  }

  next();
}
