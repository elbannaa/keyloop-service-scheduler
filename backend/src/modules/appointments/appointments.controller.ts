import { Request, Response } from 'express';
import { AppointmentsService } from './appointments.service';
import { ServiceType } from '@prisma/client';
import { Messages } from '../../constants/response';

const appointmentsService = new AppointmentsService();

export const listAppointments = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { dealershipId, status, date, startDate, endDate } = req.query;

    const appointments = await appointmentsService.listAppointments({
      userId: user.id,
      userRole: user.role,
      userEmail: user.email,
      dealershipId: dealershipId as string,
      status: status as any,
      date: date ? new Date(date as string) : undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.json({
      success: true,
      code: 200,
      message: Messages.SUCCESS,
      data: appointments,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      code: error.statusCode || 500,
      message: error.message || Messages.INTERNAL_ERROR,
    });
  }
};


export const createAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await appointmentsService.createAppointment(req.body);
    const isPending = (appointment as any).status === 'PENDING';

    res.status(201).json({
      success: true,
      code: 201,
      message: isPending ? 'Appointment request submitted for approval' : Messages.SUCCESS,
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

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const appointment = await appointmentsService.updateAppointment(id, req.body);
    res.json({
      success: true,
      code: 200,
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
export const checkAvailability = async (req: Request, res: Response) => {
  try {
    const { dealershipId, startTime, endTime } = req.query;
    const isAvailable = await appointmentsService.checkAvailability(
      dealershipId as string,
      new Date(startTime as string),
      new Date(endTime as string)
    );
    res.json({
      success: true,
      code: 200,
      message: Messages.SUCCESS,
      data: { available: isAvailable },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      code: error.statusCode || 500,
      message: error.message || Messages.INTERNAL_ERROR,
    });
  }
};

