import { DealershipsService } from './dealerships.service';
import { prismaMock } from '../../test/setup';
import { Role } from '../../constants/role';
import { ServiceType } from '@prisma/client';
import { AppError } from '../auth/auth.service';

describe('DealershipsService', () => {
  let service: DealershipsService;

  beforeEach(() => {
    service = new DealershipsService();
    jest.clearAllMocks();
  });

  describe('createDealership', () => {
    it('should create a dealership', async () => {
      const input = { name: 'Dealership A', address: 'Address A' };
      const mockDealership = { id: 'd-1', ...input, isActive: true };
      prismaMock.dealership.create.mockResolvedValue(mockDealership as any);

      const result = await service.createDealership(input);

      expect(prismaMock.dealership.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: input })
      );
      expect(result).toEqual(mockDealership);
    });
  });

  describe('listDealerships', () => {
    it('should list dealerships with no filters', async () => {
      const mockDealerships = [{ id: 'd-1', name: 'Dealer 1', _count: { technicians: 2, vehicles: 5 } }];
      prismaMock.dealership.findMany.mockResolvedValue(mockDealerships as any);

      const result = await service.listDealerships();

      expect(prismaMock.dealership.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockDealerships);
    });

    it('should filter by minTechnicians in-memory', async () => {
      const mockDealerships = [
        { id: 'd-1', name: 'Dealer 1', _count: { technicians: 1, vehicles: 5 } },
        { id: 'd-2', name: 'Dealer 2', _count: { technicians: 3, vehicles: 5 } },
      ];
      prismaMock.dealership.findMany.mockResolvedValue(mockDealerships as any);

      const result = await service.listDealerships({ minTechnicians: 2 });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('d-2');
    });

    it('should apply requesterRole USER filters', async () => {
      prismaMock.dealership.findMany.mockResolvedValue([]);

      await service.listDealerships({ requesterRole: Role.USER });

      expect(prismaMock.dealership.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            managerId: { not: null },
          }),
        })
      );
    });
  });

  describe('updateDealership', () => {
    const id = 'd-1';
    const requesterId = 'mgr-1';

    it('should throw error if dealership not found', async () => {
      prismaMock.dealership.findUnique.mockResolvedValue(null);
      await expect(service.updateDealership(id, requesterId, 'MANAGER', {})).rejects.toThrow(
        new AppError(404, 'Dealership not found')
      );
    });

    it('should throw error if MANAGER edits another dealership', async () => {
      const mockDealership = { id: 'd-1', managerId: 'mgr-2' };
      prismaMock.dealership.findUnique.mockResolvedValue(mockDealership as any);

      await expect(service.updateDealership(id, requesterId, 'MANAGER', {})).rejects.toThrow(
        new AppError(403, 'You can only edit your own dealership')
      );
    });

    it('should allow ADMIN to edit any dealership', async () => {
      const mockDealership = { id: 'd-1', managerId: 'mgr-2' };
      prismaMock.dealership.findUnique.mockResolvedValue(mockDealership as any);
      prismaMock.dealership.update.mockResolvedValue({ ...mockDealership, name: 'New Name' } as any);

      const result = await service.updateDealership(id, 'admin-1', Role.ADMIN, { name: 'New Name' });

      expect(prismaMock.dealership.update).toHaveBeenCalled();
      expect(result.name).toBe('New Name');
    });
  });

  describe('Technicians and Vehicles', () => {
    const dealershipId = 'd-1';
    const requesterId = 'mgr-1';
    const mockDealership = { id: 'd-1', managerId: 'mgr-1' };

    beforeEach(() => {
      prismaMock.dealership.findUnique.mockResolvedValue(mockDealership as any);
    });

    it('should create technician for owned dealership', async () => {
      const input = { name: 'Tech 1' };
      prismaMock.technician.create.mockResolvedValue({ id: 't-1', ...input } as any);

      const result = await service.createTechnician(dealershipId, requesterId, 'MANAGER', input);

      expect(prismaMock.technician.create).toHaveBeenCalled();
      expect(result.id).toBe('t-1');
    });

    it('should throw error when adding tech to others dealership', async () => {
      await expect(service.createTechnician(dealershipId, 'mgr-2', 'MANAGER', { name: 'Tech 1' })).rejects.toThrow(
        new AppError(403, 'You can only add technicians to your own dealership')
      );
    });

    it('should delete vehicle when authorized', async () => {
      const vehicleId = 'v-1';
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: vehicleId, dealershipId } as any);
      prismaMock.vehicle.delete.mockResolvedValue({ id: vehicleId } as any);

      const result = await service.deleteVehicle(dealershipId, vehicleId, requesterId, 'MANAGER');

      expect(prismaMock.vehicle.delete).toHaveBeenCalled();
      expect(result.id).toBe(vehicleId);
    });
  });
});
