import { Request, Response } from 'express';
import { AppointmentsService } from '@/modules/appointments/appointments.service';
import { Messages } from '@/constants/response';

const appointmentsService = new AppointmentsService();

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: List appointments
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dealershipId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: List of appointments
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dealershipId
 *               - userId
 *               - carModel
 *               - carPlate
 *               - startTime
 *               - endTime
 *               - serviceIds
 *             properties:
 *               dealershipId:
 *                 type: string
 *               userId:
 *                 type: string
 *               carModel:
 *                 type: string
 *               carPlate:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               serviceIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       400:
 *         description: Validation error
 */
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

/**
 * @swagger
 * /api/appointments/{id}:
 *   patch:
 *     summary: Update an appointment (Admin/Manager only)
 *     tags: [Appointments]
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
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
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

/**
 * @swagger
 * /api/appointments/{id}/cancel:
 *   patch:
 *     summary: Cancel an appointment
 *     tags: [Appointments]
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
 *         description: Appointment cancelled successfully
 *       401:
 *         description: Unauthorized
 */
export const cancelAppointment = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const id = req.params.id as string;
    await appointmentsService.cancelAppointment(id, user);
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

/**
 * @swagger
 * /api/appointments/schedule:
 *   get:
 *     summary: Get dealership schedule (Admin/Manager only)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dealershipId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Dealership schedule
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
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

/**
 * @swagger
 * /api/appointments/check-availability:
 *   get:
 *     summary: Check dealership availability
 *     tags: [Appointments]
 *     parameters:
 *       - in: query
 *         name: dealershipId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startTime
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endTime
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Availability status
 */
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

