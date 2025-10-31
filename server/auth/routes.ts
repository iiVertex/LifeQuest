import { Router, type Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { hashPassword, comparePassword, validatePasswordStrength } from './password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from './jwt';
import { authenticateToken } from './middleware';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(8),
  name: z.string().optional(),
  email: z.string().email().optional(),
  age: z.number().optional(),
  gender: z.string().optional(),
  focusAreas: z.array(z.string()).optional(),
  advisorTone: z.string().optional(),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const body = registerSchema.parse(req.body);

    // Validate password strength
    const passwordValidation = validatePasswordStrength(body.password);
    if (!passwordValidation.valid) {
      res.status(400).json({
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors,
      });
      return;
    }

    // Check if username already exists
    const existingUser = await storage.getUserByUsername(body.username);
    if (existingUser) {
      res.status(409).json({ message: 'Username already taken' });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(body.password);

    // Create user in memory
    const user = await storage.createUser({
      username: body.username,
      password: hashedPassword,
      name: body.name,
      email: body.email,
      age: body.age,
      gender: body.gender,
      focusAreas: body.focusAreas || [],
      advisorTone: body.advisorTone,
    });

    console.log(`✅ New user registered: ${user.username} (${user.id})`);

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set cookies
    res.cookie('accessToken', accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      message: 'Registration successful',
      user: userWithoutPassword,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }

    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * Login existing user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body);

    // Find user
    const user = await storage.getUserByUsername(body.username);
    if (!user) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    // Verify password
    const isValidPassword = await comparePassword(body.password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set cookies
    res.cookie('accessToken', accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    // Update daily streak on login (only once per day)
    let streakUpdate;
    try {
      const { updateDailyStreak } = await import('../services/streak-tracker');
      streakUpdate = await updateDailyStreak(user.id);
      console.log('[Login Streak]', streakUpdate.message);
    } catch (error) {
      console.error('[Login Streak] Error updating streak:', error);
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      streak: streakUpdate,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }

    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

/**
 * POST /api/auth/logout
 * Logout current user
 */
router.post('/logout', (_req: Request, res: Response) => {
  // Clear cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.json({ message: 'Logout successful' });
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ message: 'Refresh token required' });
    return;
  }

  const payload = verifyRefreshToken(refreshToken);

  if (!payload) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
    return;
  }

  // Get user
  const user = await storage.getUser(payload.userId);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  // Generate new access token
  const newAccessToken = generateAccessToken(user);

  // Set new access token cookie
  res.cookie('accessToken', newAccessToken, ACCESS_TOKEN_COOKIE_OPTIONS);

  res.json({ message: 'Token refreshed successfully' });
});

/**
 * GET /api/auth/me
 * Get current user info (protected route)
 */
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  const user = await storage.getUser(req.user!.userId);

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  // Return user data (without password)
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

export default router;
