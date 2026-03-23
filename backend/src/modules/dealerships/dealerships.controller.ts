import { Response } from 'express';
import { AuthRequest } from '@/middleware/auth';
import { DealershipsService } from '@/modules/dealerships/dealerships.service';
import { AppError } from '@/modules/auth/auth.service';
import { ApiResponse, ErrorCode, Messages } from '@/constants/response';

const dealershipsService = new DealershipsService();

export class DealershipsController {
  /**
   * @swagger
   * /api/dealerships:
   *   post:
   *     summary: Create a new dealership (Admin only)
   *     tags: [Dealerships]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - address
   *             properties:
   *               name:
   *                 type: string
   *               address:
   *                 type: string
   *               supportedServices:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       201:
   *         description: Dealership created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  async createDealership(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, address, supportedServices } = req.body;

      if (!name || !address) {
        const response: ApiResponse<null> = {
          success: false,
          code: 400,
          message: Messages.VALIDATION_ERROR,
          errors: { detail: 'name and address are required', code: ErrorCode.VALIDATION_ERROR }
        };
        res.status(400).json(response);
        return;
      }

      const dealership = await dealershipsService.createDealership({ name, address, supportedServices });
      const responseAPI: ApiResponse<{ dealership: typeof dealership }> = {
        success: true,
        code: 201,
        message: Messages.SUCCESS,
        data: { dealership }
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
   * /api/dealerships:
   *   get:
   *     summary: List dealerships
   *     tags: [Dealerships]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: vehicleMake
   *         schema:
   *           type: string
   *       - in: query
   *         name: vehicleModel
   *         schema:
   *           type: string
   *       - in: query
   *         name: vehicleYear
   *         schema:
   *           type: integer
   *       - in: query
   *         name: minTechnicians
   *         schema:
   *           type: integer
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of dealerships
   *       401:
   *         description: Unauthorized
   */
  async listDealerships(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { vehicleMake, vehicleModel, vehicleYear, minTechnicians, search } = req.query as Record<string, string>;

      const dealerships = await dealershipsService.listDealerships({
        vehicleMake,
        vehicleModel,
        vehicleYear: vehicleYear ? parseInt(vehicleYear, 10) : undefined,
        minTechnicians: minTechnicians ? parseInt(minTechnicians, 10) : undefined,
        search,
        requesterRole: req.user!.role,
      });

      const responseAPI: ApiResponse<{ dealerships: typeof dealerships }> = {
        success: true,
        code: 200,
        message: Messages.SUCCESS,
        data: { dealerships }
      };
      res.status(200).json(responseAPI);
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/dealerships/{id}:
   *   get:
   *     summary: Get dealership by ID
   *     tags: [Dealerships]
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
   *         description: Dealership details
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Dealership not found
   */
  async getDealership(req: AuthRequest, res: Response): Promise<void> {
    const id = req.params['id'] as string;
    try {
      const dealership = await dealershipsService.getDealership(id);
      const responseAPI: ApiResponse<{ dealership: typeof dealership }> = {
        success: true,
        code: 200,
        message: Messages.SUCCESS,
        data: { dealership }
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
   * /api/dealerships/{id}:
   *   patch:
   *     summary: Update dealership info (Admin or Manager)
   *     tags: [Dealerships]
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
   *               address:
   *                 type: string
   *               supportedServices:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       200:
   *         description: Dealership updated successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  async updateDealership(req: AuthRequest, res: Response): Promise<void> {
    const id = req.params['id'] as string;
    try {
      const { name, address, supportedServices } = req.body;

      if (name === undefined && address === undefined) {
        const response: ApiResponse<null> = {
          success: false,
          code: 400,
          message: Messages.VALIDATION_ERROR,
          errors: { detail: 'At least one of name or address is required', code: ErrorCode.VALIDATION_ERROR }
        };
        res.status(400).json(response);
        return;
      }

      const dealership = await dealershipsService.updateDealership(
        id,
        req.user!.id,
        req.user!.role,
        { name, address, supportedServices }
      );

      const responseAPI: ApiResponse<{ dealership: typeof dealership }> = {
        success: true,
        code: 200,
        message: Messages.SUCCESS,
        data: { dealership }
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
   * /api/dealerships/{id}/manager:
   *   patch:
   *     summary: Assign a manager to a dealership (Admin only)
   *     tags: [Dealerships]
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
   *               - managerId
   *             properties:
   *               managerId:
   *                 type: string
   *     responses:
   *       200:
   *         description: Manager assigned successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  async assignManager(req: AuthRequest, res: Response): Promise<void> {
    const id = req.params['id'] as string;
    try {
      const { managerId } = req.body;

      if (!managerId) {
        const response: ApiResponse<null> = {
          success: false,
          code: 400,
          message: Messages.VALIDATION_ERROR,
          errors: { detail: 'managerId is required', code: ErrorCode.VALIDATION_ERROR }
        };
        res.status(400).json(response);
        return;
      }

      const dealership = await dealershipsService.assignManager(id, managerId);
      const responseAPI: ApiResponse<{ dealership: typeof dealership }> = {
        success: true,
        code: 200,
        message: Messages.SUCCESS,
        data: { dealership }
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
   * /api/dealerships/{id}/status:
   *   patch:
   *     summary: Set dealership active/inactive status (Admin or Manager)
   *     tags: [Dealerships]
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
   *         description: Dealership status updated successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  async setDealershipActive(req: AuthRequest, res: Response): Promise<void> {
    const id = req.params['id'] as string;
    try {
      const { isActive } = req.body;

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

      const dealership = await dealershipsService.setDealershipActive(id, isActive);
      const responseAPI: ApiResponse<{ dealership: typeof dealership }> = {
        success: true,
        code: 200,
        message: Messages.SUCCESS,
        data: { dealership }
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

  // ─── Technicians ───────────────────────────────────────────────────

  /**
   * @swagger
   * /api/dealerships/{id}/technicians:
   *   post:
   *     summary: Create a technician for a dealership (Admin or Manager)
   *     tags: [Dealerships]
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
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *     responses:
   *       201:
   *         description: Technician created successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  async createTechnician(req: AuthRequest, res: Response): Promise<void> {
    const dealershipId = req.params['id'] as string;
    try {
      const { name } = req.body;

      if (!name) {
        const response: ApiResponse<null> = {
          success: false,
          code: 400,
          message: Messages.VALIDATION_ERROR,
          errors: { detail: 'name is required', code: ErrorCode.VALIDATION_ERROR }
        };
        res.status(400).json(response);
        return;
      }

      const technician = await dealershipsService.createTechnician(
        dealershipId,
        req.user!.id,
        req.user!.role,
        { name }
      );

      const responseAPI: ApiResponse<{ technician: typeof technician }> = {
        success: true,
        code: 201,
        message: Messages.SUCCESS,
        data: { technician }
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
   * /api/dealerships/{id}/technicians:
   *   get:
   *     summary: List technicians for a dealership
   *     tags: [Dealerships]
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
   *         description: List of technicians
   *       401:
   *         description: Unauthorized
   */
  async listTechnicians(req: AuthRequest, res: Response): Promise<void> {
    const dealershipId = req.params['id'] as string;
    try {
      const technicians = await dealershipsService.listTechnicians(dealershipId);
      const responseAPI: ApiResponse<{ technicians: typeof technicians }> = {
        success: true,
        code: 200,
        message: Messages.SUCCESS,
        data: { technicians }
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

  // ─── Vehicles ──────────────────────────────────────────────────────

  /**
   * @swagger
   * /api/dealerships/{id}/vehicles:
   *   post:
   *     summary: Create a vehicle for a dealership (Admin or Manager)
   *     tags: [Dealerships]
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
   *               - make
   *               - model
   *               - year
   *             properties:
   *               make:
   *                 type: string
   *               model:
   *                 type: string
   *               year:
   *                 type: integer
   *     responses:
   *       201:
   *         description: Vehicle created successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  async createVehicle(req: AuthRequest, res: Response): Promise<void> {
    const dealershipId = req.params['id'] as string;
    try {
      const { make, model, year } = req.body;

      if (!make || !model || !year) {
        const response: ApiResponse<null> = {
          success: false,
          code: 400,
          message: Messages.VALIDATION_ERROR,
          errors: { detail: 'make, model, and year are required', code: ErrorCode.VALIDATION_ERROR }
        };
        res.status(400).json(response);
        return;
      }

      if (typeof year !== 'number') {
        const response: ApiResponse<null> = {
          success: false,
          code: 400,
          message: Messages.VALIDATION_ERROR,
          errors: { detail: 'year must be a number', code: ErrorCode.VALIDATION_ERROR }
        };
        res.status(400).json(response);
        return;
      }

      const vehicle = await dealershipsService.createVehicle(
        dealershipId,
        req.user!.id,
        req.user!.role,
        { make, model, year }
      );

      const responseAPI: ApiResponse<{ vehicle: typeof vehicle }> = {
        success: true,
        code: 201,
        message: Messages.SUCCESS,
        data: { vehicle }
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
   * /api/dealerships/{id}/vehicles:
   *   get:
   *     summary: List vehicles for a dealership
   *     tags: [Dealerships]
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
   *         description: List of vehicles
   *       401:
   *         description: Unauthorized
   */
  async listVehicles(req: AuthRequest, res: Response): Promise<void> {
    const dealershipId = req.params['id'] as string;
    try {
      const vehicles = await dealershipsService.listVehicles(dealershipId);
      const responseAPI: ApiResponse<{ vehicles: typeof vehicles }> = {
        success: true,
        code: 200,
        message: Messages.SUCCESS,
        data: { vehicles }
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
   * /api/dealerships/{id}/technicians/{technicianId}:
   *   delete:
   *     summary: Delete a technician (Admin or Manager)
   *     tags: [Dealerships]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: technicianId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Technician deleted successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  async deleteTechnician(req: AuthRequest, res: Response): Promise<void> {
    const dealershipId = req.params['id'] as string;
    const technicianId = req.params['technicianId'] as string;
    try {
      const result = await dealershipsService.deleteTechnician(
        dealershipId,
        technicianId,
        req.user!.id,
        req.user!.role
      );
      const responseAPI: ApiResponse<typeof result> = {
        success: true,
        code: 200,
        message: 'Technician deleted successfully',
        data: result
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
   * /api/dealerships/{id}/vehicles/{vehicleId}:
   *   delete:
   *     summary: Delete a vehicle (Admin or Manager)
   *     tags: [Dealerships]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: vehicleId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Vehicle deleted successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  async deleteVehicle(req: AuthRequest, res: Response): Promise<void> {
    const dealershipId = req.params['id'] as string;
    const vehicleId = req.params['vehicleId'] as string;
    try {
      const result = await dealershipsService.deleteVehicle(
        dealershipId,
        vehicleId,
        req.user!.id,
        req.user!.role
      );
      const responseAPI: ApiResponse<typeof result> = {
        success: true,
        code: 200,
        message: 'Vehicle deleted successfully',
        data: result
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
