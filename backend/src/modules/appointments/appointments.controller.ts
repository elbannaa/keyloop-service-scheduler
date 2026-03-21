import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { AppointmentsService } from './appointments.service';
import { ApiResponse, Messages } from '../../constants/response';
import { ServiceType } from '@prisma/client';

const appointmentsService = new AppointmentsService();

export class AppointmentsController {
  async listAvailability(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { dealershipId, serviceType, date } = req.query as Record<string, string>;

      if (!dealershipId || !serviceType || !date) {
        res.status(400).json({
          success: false,
          code: 400,
          message: 'dealershipId, serviceType, and date are required',
        });
        return;
      }

      const slots = await appointmentsService.listAvailability(
        dealershipId,
        serviceType as ServiceType,
        new Date(date)
      );

      res.status(200).json({
        success: true,
        code: 200,
        message: Messages.SUCCESS,
        data: { slots },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, code: 500, message: 'Internal server error' });
    }
  }

  async createAppointment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { 
        dealershipId, 
        serviceType, 
        startTime, 
        customerName, 
        customerEmail, 
        vehicleInfo 
      } = req.body;

      if (!dealershipId || !serviceType || !startTime || !customerName || !customerEmail) {
        res.status(400).json({
          success: false,
          code: 400,
          message: 'Required fields missing',
        });
        return;
      }

      const appointment = await appointmentsService.createAppointment({
        dealershipId,
        serviceType: serviceType as ServiceType,
        startTime: new Date(startTime),
        customerName,
        customerEmail,
        vehicleInfo,
      });

      res.status(201).json({
        success: true,
        code: 201,
        message: 'Appointment booked successfully',
        data: { appointment },
      });
    } catch (error: any) {
      console.error(error);
      res.status(error.statusCode || 500).json({
        success: false,
        code: error.statusCode || 500,
        message: error.message || 'Internal server error',
      });
    }
  }
}
