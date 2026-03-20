import { Request, Response } from 'express';
import { AuthService, AppError } from './auth.service';
import { AuthRequest } from '../../middleware/auth';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, phone } = req.body;

      // Validation
      if (!email || !password || !name) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Email, password, and name are required',
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Password must be at least 6 characters',
        });
        return;
      }

      const result = await authService.register({ email, password, name, phone });
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: 'Registration Error',
          message: error.message,
        });
        return;
      }
      throw error;
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Email and password are required',
        });
        return;
      }

      const result = await authService.login({ email, password });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: 'Authentication Error',
          message: error.message,
        });
        return;
      }
      throw error;
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        res.status(400).json({
          error: 'Logout Error',
          message: 'No token provided',
        });
        return;
      }

      const result = await authService.logout(token);
      res.status(200).json(result);
    } catch (error) {
      throw error;
    }
  }

  async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const user = await authService.getMe(req.user.id);
      res.status(200).json({ user });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: 'Error',
          message: error.message,
        });
        return;
      }
      throw error;
    }
  }
}
