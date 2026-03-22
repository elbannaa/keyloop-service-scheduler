import { Router } from 'express';
import * as appointmentsController from './appointments.controller';
import { authGuard, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', authGuard, appointmentsController.listAppointments);
router.post('/', appointmentsController.createAppointment);
router.patch('/:id', authGuard, requireRole(Role.ADMIN, Role.MANAGER), appointmentsController.updateAppointment);

router.get('/availability', appointmentsController.listAvailability);
router.get('/check-availability', appointmentsController.checkAvailability);

router.get('/schedule', authGuard, requireRole(Role.ADMIN, Role.MANAGER), appointmentsController.getSchedule);
router.patch('/:id/cancel', authGuard, requireRole(Role.ADMIN, Role.MANAGER), appointmentsController.cancelAppointment);

export default router;
