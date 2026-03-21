import { Router } from 'express';
import { AppointmentsController } from './appointments.controller';
import { authGuard } from '../../middleware/auth';

const router = Router();
const appointmentsController = new AppointmentsController();

router.get('/availability', authGuard, (req, res) => appointmentsController.listAvailability(req, res));
router.post('/', authGuard, (req, res) => appointmentsController.createAppointment(req, res));

export default router;
