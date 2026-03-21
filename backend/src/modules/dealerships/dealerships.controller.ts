import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { DealershipsService } from './dealerships.service';
import { AppError } from '../auth/auth.service';
import { ApiResponse, ErrorCode, Messages } from '../../constants/response';

const dealershipsService = new DealershipsService();

export class DealershipsController {
  async createDealership(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, address, phone } = req.body;

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

      const dealership = await dealershipsService.createDealership({ name, address, phone });
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

  async listDealerships(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { vehicleMake, vehicleModel, vehicleYear, minTechnicians, search } = req.query as Record<string, string>;

      const dealerships = await dealershipsService.listDealerships({
        vehicleMake,
        vehicleModel,
        vehicleYear: vehicleYear ? parseInt(vehicleYear, 10) : undefined,
        minTechnicians: minTechnicians ? parseInt(minTechnicians, 10) : undefined,
        search,
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

  async updateDealership(req: AuthRequest, res: Response): Promise<void> {
    const id = req.params['id'] as string;
    try {
      const { name, address, phone } = req.body;

      if (name === undefined && address === undefined && phone === undefined) {
        const response: ApiResponse<null> = {
          success: false,
          code: 400,
          message: Messages.VALIDATION_ERROR,
          errors: { detail: 'At least one of name, address, or phone is required', code: ErrorCode.VALIDATION_ERROR }
        };
        res.status(400).json(response);
        return;
      }

      const dealership = await dealershipsService.updateDealership(
        id,
        req.user!.id,
        req.user!.role,
        { name, address, phone }
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

  async createTechnician(req: AuthRequest, res: Response): Promise<void> {
    const dealershipId = req.params['id'] as string;
    try {
      const { name, phone } = req.body;

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
        { name, phone }
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
