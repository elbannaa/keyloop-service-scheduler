import { Router } from 'express';
import { DealershipsController } from './dealerships.controller';
import { authGuard, requireRole } from '../../middleware/auth';

const router = Router();
const dealershipsController = new DealershipsController();

// CREATE — Admin only
router.post(
  '/',
  authGuard,
  requireRole('ADMIN'),
  (req, res) => dealershipsController.createDealership(req, res)
);

// LIST — Any authenticated role
router.get(
  '/',
  authGuard,
  (req, res) => dealershipsController.listDealerships(req, res)
);

// GET DETAIL — Any authenticated role
router.get(
  '/:id',
  authGuard,
  (req, res) => dealershipsController.getDealership(req, res)
);

// EDIT info (name/address/phone) — Admin or Manager (ownership enforced in service)
router.patch(
  '/:id',
  authGuard,
  requireRole('ADMIN', 'MANAGER'),
  (req, res) => dealershipsController.updateDealership(req, res)
);

// ASSIGN MANAGER — Admin only
router.patch(
  '/:id/manager',
  authGuard,
  requireRole('ADMIN'),
  (req, res) => dealershipsController.assignManager(req, res)
);

// SET ACTIVE/INACTIVE — Admin or Manager (ownership enforced in service)
router.patch(
  '/:id/status',
  authGuard,
  requireRole('ADMIN', 'MANAGER'),
  (req, res) => dealershipsController.setDealershipActive(req, res)
);

// ─── Technicians sub-resource ─────────────────────────────────────────

router.post(
  '/:id/technicians',
  authGuard,
  requireRole('ADMIN', 'MANAGER'),
  (req, res) => dealershipsController.createTechnician(req, res)
);

router.get(
  '/:id/technicians',
  authGuard,
  (req, res) => dealershipsController.listTechnicians(req, res)
);

// ─── Vehicles sub-resource ────────────────────────────────────────────

router.post(
  '/:id/vehicles',
  authGuard,
  requireRole('ADMIN', 'MANAGER'),
  (req, res) => dealershipsController.createVehicle(req, res)
);

router.get(
  '/:id/vehicles',
  authGuard,
  (req, res) => dealershipsController.listVehicles(req, res)
);

export default router;
