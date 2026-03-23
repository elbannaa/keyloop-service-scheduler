import { Response } from 'express';
import { AuthRequest } from '@/middleware/auth';
import { UsersService } from '@/modules/users/users.service';
import { AppError } from '@/modules/auth/auth.service';
import { Role } from '@prisma/client';
import { ApiResponse, ErrorCode, Messages } from '@/constants/response';

const usersService = new UsersService();

export class UsersController {
  /**
   * @swagger
   * /api/users:
   *   post:
   *     summary: Create a new user (Admin only)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - name
   *               - role
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 minimum: 6
   *               name:
   *                 type: string
   *               role:
   *                 type: string
   *                 enum: [ADMIN, MANAGER, USER]
   *     responses:
   *       201:
   *         description: User created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  async createUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password, name, role } = req.body;

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

      const user = await usersService.createUser({ email, password, name, role });
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

  /**
   * @swagger
   * /api/users:
   *   get:
   *     summary: List all users (Admin only)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: role
   *         schema:
   *           type: string
   *           enum: [ADMIN, MANAGER, USER]
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *     responses:
   *       200:
   *         description: List of users
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
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

  /**
   * @swagger
   * /api/users/{id}:
   *   get:
   *     summary: Get user by ID (Admin only)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: User details
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: User not found
   */
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

  /**
   * @swagger
   * /api/users/{id}:
   *   patch:
   *     summary: Update user (Admin only)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               role:
   *                 type: string
   *                 enum: [ADMIN, MANAGER, USER]
   *     responses:
   *       200:
   *         description: User updated successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: User not found
   */
  async updateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, role } = req.body;
      const id = req.params['id'] as string;

      if (name === undefined && role === undefined) {
        const response: ApiResponse<null> = {
          success: false,
          code: 400,
          message: Messages.VALIDATION_ERROR,
          errors: { detail: 'name or role is required', code: ErrorCode.VALIDATION_ERROR }
        };
        res.status(400).json(response);
        return;
      }

      if (role && !Object.values(Role).includes(role)) {
        const response: ApiResponse<null> = {
          success: false,
          code: 400,
          message: Messages.VALIDATION_ERROR,
          errors: { detail: `role must be one of: ${Object.values(Role).join(', ')}`, code: ErrorCode.VALIDATION_ERROR }
        };
        res.status(400).json(response);
        return;
      }

      const user = await usersService.updateUser(id, { name, role });
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

  /**
   * @swagger
   * /api/users/{id}/status:
   *   patch:
   *     summary: Set user active/inactive status (Admin only)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - isActive
   *             properties:
   *               isActive:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: User status updated successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: User not found
   */
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
