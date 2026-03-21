import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { UsersService } from './users.service';
import { AppError } from '../auth/auth.service';
import { Role } from '@prisma/client';
import { ApiResponse, ErrorCode, Messages } from '../../constants/response';

const usersService = new UsersService();

export class UsersController {
  async createUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password, name, phone, role } = req.body;

      if (!email || !name || !role) {
        const response: ApiResponse<null> = {
          success: false,
          code: 400,
          message: Messages.VALIDATION_ERROR,
          errors: { detail: 'email, name, and role are required', code: ErrorCode.VALIDATION_ERROR }
        };
        res.status(400).json(response);
        return;
      }

      if (!Object.values(Role).includes(role)) {
        const response: ApiResponse<null> = {
          success: false,
          code: 400,
          message: Messages.VALIDATION_ERROR,
          errors: { detail: `role must be one of: ${Object.values(Role).join(', ')}`, code: ErrorCode.VALIDATION_ERROR }
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

      const user = await usersService.createUser({ email, password, name, phone, role });
      const responseAPI: ApiResponse<{ user: typeof user }> = {
        success: true,
        code: 201,
        message: Messages.SUCCESS,
        data: { user }
      };
      res.status(201).json(responseAPI);
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

  async listUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { role, search, page, limit } = req.query as Record<string, string>;

      const result = await usersService.listUsers({
        role: role as Role | undefined,
        search,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });

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

  async getUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const user = await usersService.getUser(id);
      
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

  async updateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, phone } = req.body;
      const id = req.params['id'] as string;

      if (name === undefined && phone === undefined) {
        const response: ApiResponse<null> = {
          success: false,
          code: 400,
          message: Messages.VALIDATION_ERROR,
          errors: { detail: 'At least one of name or phone is required', code: ErrorCode.VALIDATION_ERROR }
        };
        res.status(400).json(response);
        return;
      }

      const user = await usersService.updateUser(id, { name, phone });
      const responseAPI: ApiResponse<{ user: typeof user }> = {
        success: true,
        code: 200,
        message: Messages.SUCCESS,
        data: { user }
      };
      res.status(200).json(responseAPI);
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

  async setUserActive(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { isActive } = req.body;
      const id = req.params['id'] as string;

      if (typeof isActive !== 'boolean') {
        const response: ApiResponse<null> = {
          success: false,
          code: 400,
          message: Messages.VALIDATION_ERROR,
          errors: { detail: 'isActive must be a boolean', code: ErrorCode.VALIDATION_ERROR }
        };
        res.status(400).json(response);
        return;
      }

      const user = await usersService.setUserActive(id, isActive);
      const responseAPI: ApiResponse<{ user: typeof user }> = {
        success: true,
        code: 200,
        message: Messages.SUCCESS,
        data: { user }
      };
      res.status(200).json(responseAPI);
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
