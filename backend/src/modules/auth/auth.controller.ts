import { Request, Response } from 'express';
import { AuthService, AppError } from './auth.service';
import { AuthRequest } from '../../middleware/auth';
import { ApiResponse, ErrorCode, Messages } from '../../constants/response';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, phone } = req.body;

      // Validation
      if (!email || !password || !name) {
        const response: ApiResponse<null> = {
          success: false,
          code: 400,
          message: Messages.VALIDATION_ERROR,
          errors: { detail: 'Email, password, and name are required', code: ErrorCode.VALIDATION_ERROR }
        };
        res.status(400).json(response);
        return;
      }

      if (password.length < 6) {
        const response: ApiResponse<null> = {
          success: false,
          code: 400,
          message: Messages.VALIDATION_ERROR,
          errors: { detail: 'Password must be at least 6 characters', code: ErrorCode.VALIDATION_ERROR }
        };
        res.status(400).json(response);
        return;
      }

      const result = await authService.register({ email, password, name, phone });
      
      const response: ApiResponse<typeof result> = {
        success: true,
        code: 201,
        message: Messages.SUCCESS,
        data: result
      };
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        const response: ApiResponse<null> = {
          success: false,
          code: error.statusCode,
          message: error.message,
          errors: { code: ErrorCode.UNKNOWN }
        };
        res.status(error.statusCode).json(response);
        return;
      }
      throw error;
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        const response: ApiResponse<null> = {
          success: false,
          code: 400,
          message: Messages.VALIDATION_ERROR,
          errors: { detail: 'Email and password are required', code: ErrorCode.VALIDATION_ERROR }
        };
        res.status(400).json(response);
        return;
      }

      const result = await authService.login({ email, password });
      
      const response: ApiResponse<typeof result> = {
        success: true,
        code: 200,
        message: Messages.SUCCESS,
        data: result
      };
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        const response: ApiResponse<null> = {
          success: false,
          code: error.statusCode,
          message: error.message,
          errors: { code: ErrorCode.UNKNOWN }
        };
        res.status(error.statusCode).json(response);
        return;
      }
      throw error;
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        const response: ApiResponse<null> = {
          success: false,
          code: 400,
          message: Messages.VALIDATION_ERROR,
          errors: { detail: 'No token provided', code: ErrorCode.VALIDATION_ERROR }
        };
        res.status(400).json(response);
        return;
      }

      const result = await authService.logout(token);
      
      const response: ApiResponse<typeof result> = {
        success: true,
        code: 200,
        message: Messages.SUCCESS,
        data: result
      };
      res.status(200).json(response);
    } catch (error) {
      throw error;
    }
  }

  async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse<null> = {
          success: false,
          code: 401,
          message: Messages.UNAUTHORIZED,
          errors: { detail: 'User not authenticated', code: ErrorCode.UNAUTHORIZED }
        };
        res.status(401).json(response);
        return;
      }

      const user = await authService.getMe(req.user.id);
      
      const response: ApiResponse<{ user: typeof user }> = {
        success: true,
        code: 200,
        message: Messages.SUCCESS,
        data: { user }
      };
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        const response: ApiResponse<null> = {
          success: false,
          code: error.statusCode,
          message: error.message,
          errors: { code: ErrorCode.UNKNOWN }
        };
        res.status(error.statusCode).json(response);
        return;
      }
      throw error;
    }
  }
}
