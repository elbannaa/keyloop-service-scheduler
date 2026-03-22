import { Router } from 'express';
import * as appointmentsController from './appointments.controller';
import { authGuard, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.get('/availability', appointmentsController.listAvailability);
router.post('/', appointmentsController.createAppointment);

router.get('/schedule', authGuard, requireRole(Role.ADMIN, Role.MANAGER), appointmentsController.getSchedule);
router.patch('/:id/cancel', authGuard, requireRole(Role.ADMIN, Role.MANAGER), appointmentsController.cancelAppointment);

export default router;
