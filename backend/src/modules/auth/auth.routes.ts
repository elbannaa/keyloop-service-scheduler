import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authGuard } from '../../middleware/auth';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));

// Protected routes
router.post('/logout', authGuard, (req, res) => authController.logout(req, res));
router.get('/me', authGuard, (req, res) => authController.getMe(req, res));

export default router;
