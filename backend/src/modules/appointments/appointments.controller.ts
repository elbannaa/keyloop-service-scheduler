import { Request, Response } from 'express';
import { AppointmentsService } from './appointments.service';
import { ServiceType } from '@prisma/client';
import { Messages } from '../../constants/response';

const appointmentsService = new AppointmentsService();

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await appointmentsService.createAppointment(req.body);
    res.status(201).json({
      success: true,
      code: 201,
      message: Messages.SUCCESS,
      data: appointment,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      code: error.statusCode || 500,
      message: error.message || Messages.INTERNAL_ERROR,
    });
  }
};

export const listAvailability = async (req: Request, res: Response) => {
  try {
    const { dealershipId, serviceType, date } = req.query;
    const slots = await appointmentsService.listAvailability(
      dealershipId as string,
      serviceType as ServiceType,
      new Date(date as string)
    );
    res.json({
      success: true,
      code: 200,
      message: Messages.SUCCESS,
      data: slots,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      code: error.statusCode || 500,
      message: error.message || Messages.INTERNAL_ERROR,
    });
  }
};

export const getSchedule = async (req: Request, res: Response) => {
  try {
    const { dealershipId, date } = req.query;
    const schedule = await appointmentsService.getDealershipSchedule(
      dealershipId as string,
      new Date(date as string)
    );
    res.json({
      success: true,
      code: 200,
      message: Messages.SUCCESS,
      data: schedule,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      code: error.statusCode || 500,
      message: error.message || Messages.INTERNAL_ERROR,
    });
  }
};

export const cancelAppointment = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await appointmentsService.cancelAppointment(id);
    res.json({
      success: true,
      code: 200,
      message: Messages.SUCCESS,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      code: error.statusCode || 500,
      message: error.message || Messages.INTERNAL_ERROR,
    });
  }
};
