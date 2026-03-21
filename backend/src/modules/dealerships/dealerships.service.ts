import prisma from '../../lib/prisma';
import { AppError } from '../auth/auth.service';

interface CreateDealershipInput {
  name: string;
  address: string;
  phone?: string;
}

interface UpdateDealershipInput {
  name?: string;
  address?: string;
  phone?: string;
}

interface ListDealershipsFilters {
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  minTechnicians?: number;
  search?: string;
}

interface CreateTechnicianInput {
  name: string;
  phone?: string;
}

interface CreateVehicleInput {
  make: string;
  model: string;
  year: number;
}

export class DealershipsService {
  async createDealership(input: CreateDealershipInput) {
    const dealership = await prisma.dealership.create({
      data: input,
      include: { manager: { select: { id: true, name: true, email: true } } },
    });

    return dealership;
  }

  async listDealerships(filters: ListDealershipsFilters = {}) {
    const { vehicleMake, vehicleModel, vehicleYear, minTechnicians, search } = filters;

    // Build vehicle filter for the nested where
    const vehicleFilter =
      vehicleMake || vehicleModel || vehicleYear
        ? {
          some: {
            ...(vehicleMake && {
              make: { contains: vehicleMake, mode: 'insensitive' as const },
            }),
            ...(vehicleModel && {
              model: { contains: vehicleModel, mode: 'insensitive' as const },
            }),
            ...(vehicleYear && { year: vehicleYear }),
          },
        }
        : undefined;

    const where: any = {
      ...(vehicleFilter && { vehicles: vehicleFilter }),
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const dealerships = await prisma.dealership.findMany({
      where,
      include: {
        manager: { select: { id: true, name: true, email: true } },
        _count: { select: { technicians: { where: { isActive: true } }, vehicles: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Apply minTechnicians filter in-memory (after count is resolved)
    const result =
      minTechnicians !== undefined
        ? dealerships.filter((d) => d._count.technicians >= minTechnicians)
        : dealerships;

    return result;
  }

  async getDealership(id: string) {
    const dealership = await prisma.dealership.findUnique({
      where: { id },
      include: {
        manager: { select: { id: true, name: true, email: true } },
        technicians: true,
        vehicles: true,
        _count: { select: { technicians: { where: { isActive: true } }, vehicles: true } },
      },
    });

    if (!dealership) {
      throw new AppError(404, 'Dealership not found');
    }

    return dealership;
  }

  async updateDealership(id: string, requesterId: string, requesterRole: string, input: UpdateDealershipInput) {
    const dealership = await prisma.dealership.findUnique({ where: { id } });
    if (!dealership) {
      throw new AppError(404, 'Dealership not found');
    }

    // MANAGER can only edit their own dealership
    if (requesterRole === 'MANAGER' && dealership.managerId !== requesterId) {
      throw new AppError(403, 'You can only edit your own dealership');
    }

    const updated = await prisma.dealership.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.address !== undefined && { address: input.address }),
        ...(input.phone !== undefined && { phone: input.phone }),
      },
      include: { manager: { select: { id: true, name: true, email: true } } },
    });

    return updated;
  }

  async assignManager(id: string, managerId: string) {
    const dealership = await prisma.dealership.findUnique({ where: { id } });
    if (!dealership) {
      throw new AppError(404, 'Dealership not found');
    }

    // Ensure target user exists and has MANAGER role
    const manager = await prisma.user.findUnique({ where: { id: managerId } });
    if (!manager) {
      throw new AppError(404, 'Manager user not found');
    }
    if (manager.role !== 'MANAGER') {
      throw new AppError(400, 'Assigned user must have MANAGER role');
    }

    const updated = await prisma.dealership.update({
      where: { id },
      data: { managerId },
      include: { manager: { select: { id: true, name: true, email: true } } },
    });

    return updated;
  }

  async setDealershipActive(id: string, isActive: boolean) {
    const dealership = await prisma.dealership.findUnique({ where: { id } });
    if (!dealership) {
      throw new AppError(404, 'Dealership not found');
    }

    const updated = await prisma.dealership.update({
      where: { id },
      data: { isActive },
      include: { manager: { select: { id: true, name: true, email: true } } },
    });

    return updated;
  }

  // ─── Technicians ───────────────────────────────────────────────────

  async createTechnician(dealershipId: string, requesterId: string, requesterRole: string, input: CreateTechnicianInput) {
    const dealership = await prisma.dealership.findUnique({ where: { id: dealershipId } });
    if (!dealership) {
      throw new AppError(404, 'Dealership not found');
    }

    if (requesterRole === 'MANAGER' && dealership.managerId !== requesterId) {
      throw new AppError(403, 'You can only add technicians to your own dealership');
    }

    const technician = await prisma.technician.create({
      data: { ...input, dealershipId },
    });

    return technician;
  }

  async listTechnicians(dealershipId: string) {
    const dealership = await prisma.dealership.findUnique({ where: { id: dealershipId } });
    if (!dealership) {
      throw new AppError(404, 'Dealership not found');
    }

    const technicians = await prisma.technician.findMany({
      where: { dealershipId },
      orderBy: { createdAt: 'desc' },
    });

    return technicians;
  }

  // ─── Vehicles ──────────────────────────────────────────────────────

  async createVehicle(dealershipId: string, requesterId: string, requesterRole: string, input: CreateVehicleInput) {
    const dealership = await prisma.dealership.findUnique({ where: { id: dealershipId } });
    if (!dealership) {
      throw new AppError(404, 'Dealership not found');
    }

    if (requesterRole === 'MANAGER' && dealership.managerId !== requesterId) {
      throw new AppError(403, 'You can only add vehicles to your own dealership');
    }

    const vehicle = await prisma.vehicle.create({
      data: { ...input, dealershipId },
    });

    return vehicle;
  }

  async listVehicles(dealershipId: string) {
    const dealership = await prisma.dealership.findUnique({ where: { id: dealershipId } });
    if (!dealership) {
      throw new AppError(404, 'Dealership not found');
    }

    const vehicles = await prisma.vehicle.findMany({
      where: { dealershipId },
      orderBy: { createdAt: 'desc' },
    });

    return vehicles;
  }
}
