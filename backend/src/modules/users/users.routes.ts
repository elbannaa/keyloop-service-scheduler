import { Router } from 'express';
import { UsersController } from './users.controller';
import { authGuard, requireRole } from '../../middleware/auth';

const router = Router();
const usersController = new UsersController();

// All users routes require ADMIN
router.post(
  '/',
  authGuard,
  requireRole('ADMIN'),
  (req, res) => usersController.createUser(req, res)
);

router.get(
  '/',
  authGuard,
  requireRole('ADMIN'),
  (req, res) => usersController.listUsers(req, res)
);

router.get(
  '/:id',
  authGuard,
  requireRole('ADMIN'),
  (req, res) => usersController.getUser(req, res)
);

router.patch(
  '/:id',
  authGuard,
  requireRole('ADMIN'),
  (req, res) => usersController.updateUser(req, res)
);

router.patch(
  '/:id/status',
  authGuard,
  requireRole('ADMIN'),
  (req, res) => usersController.setUserActive(req, res)
);

export default router;
