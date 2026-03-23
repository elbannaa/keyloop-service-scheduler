import dayjs from 'dayjs';
import { AppointmentsService } from './appointments.service';
import { prismaMock } from '../../test/setup';
import { ServiceType, AppointmentStatus, Role } from '@prisma/client';
import redis from '../../lib/redis';
import { AppError } from '../auth/auth.service';

// Redis is mocked globally in src/test/setup.ts

describe('AppointmentsService', () => {
  let service: AppointmentsService;

  beforeEach(() => {
    service = new AppointmentsService();
    jest.clearAllMocks();
  });

  describe('listAppointments', () => {
    it('should list all appointments for a manager', async () => {
      const mockAppointments = [
        { id: '1', customerEmail: 'test@example.com', startTime: new Date() },
      ];
      prismaMock.appointment.findMany.mockResolvedValue(mockAppointments as any);

      const result = await service.listAppointments({
        userId: 'manager-id',
        userRole: 'MANAGER',
        userEmail: 'manager@example.com',
        dealershipId: 'dealer-1',
      });

      expect(prismaMock.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ dealershipId: 'dealer-1' }),
        })
      );
      expect(result).toEqual(mockAppointments);
    });

    it('should filter by customer email for a basic user', async () => {
      prismaMock.appointment.findMany.mockResolvedValue([]);

      await service.listAppointments({
        userId: 'user-id',
        userRole: 'USER',
        userEmail: 'user@example.com',
      });

      expect(prismaMock.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ customerEmail: 'user@example.com' }),
        })
      );
    });
  });

  describe('createAppointment', () => {
    const input = {
      dealershipId: 'dealer-1',
      serviceType: ServiceType.VEHICLE_MAINTENANCE,
      startTime: dayjs().add(1, 'day').toDate(),
      endTime: dayjs().add(1, 'day').add(1, 'hour').toDate(),
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
    };

    it('should throw error if start time is in the past', async () => {
      const pastInput = { ...input, startTime: dayjs().subtract(1, 'day').toDate() };
      await expect(service.createAppointment(pastInput)).rejects.toThrow(
        new AppError(400, 'Appointments must be booked for a future time')
      );
    });

    it('should successfully create an appointment when resources are available', async () => {
      const mockDealership = {
        id: 'dealer-1',
        technicians: [{ id: 'tech-1', isActive: true }],
        vehicles: [{ id: 'bay-1' }],
      };
      prismaMock.dealership.findUnique.mockResolvedValue(mockDealership as any);
      
      // Mock redis availability (returning 0 for getbit means free)
      (redis.getbit as jest.Mock).mockResolvedValue(0);
      
      const mockAppointment = { id: 'app-1', ...input, status: AppointmentStatus.PENDING };
      prismaMock.appointment.create.mockResolvedValue(mockAppointment as any);

      const result = await service.createAppointment(input);

      expect(prismaMock.appointment.create).toHaveBeenCalled();
      expect(redis.setbit).toHaveBeenCalledWith(expect.any(String), expect.any(Number), 1);
      expect(result.id).toBe('app-1');
    });

    it('should throw error if no technician is available', async () => {
      const mockDealership = {
        id: 'dealer-1',
        technicians: [{ id: 'tech-1', isActive: true }],
        vehicles: [{ id: 'bay-1' }],
      };
      prismaMock.dealership.findUnique.mockResolvedValue(mockDealership as any);
      
      // Mock redis busy (returning 1 for getbit means busy)
      (redis.getbit as jest.Mock).mockResolvedValue(1);

      await expect(service.createAppointment(input)).rejects.toThrow(
        new AppError(400, 'No technicians available for this time slot')
      );
    });
  });

  describe('cancelAppointment', () => {
    const user = { id: 'user-id', role: Role.USER, email: 'user@example.com' };
    const appointmentId = 'app-1';

    it('should throw error if appointment not found', async () => {
      prismaMock.appointment.findUnique.mockResolvedValue(null);
      await expect(service.cancelAppointment(appointmentId, user)).rejects.toThrow(
        new AppError(404, 'Appointment not found')
      );
    });

    it('should throw error if user tries to cancel someone else appointment', async () => {
      const otherAppointment = { id: 'app-1', customerEmail: 'other@example.com' };
      prismaMock.appointment.findUnique.mockResolvedValue(otherAppointment as any);

      await expect(service.cancelAppointment(appointmentId, user)).rejects.toThrow(
        new AppError(403, 'You are not authorized to cancel this appointment')
      );
    });

    it('should successfully cancel and release resources', async () => {
      const mockAppointment = {
        id: 'app-1',
        customerEmail: 'user@example.com',
        dealershipId: 'dealer-1',
        technicianId: 'tech-1',
        vehicleId: 'bay-1',
        startTime: new Date(),
        endTime: new Date(),
      };
      prismaMock.appointment.findUnique.mockResolvedValue(mockAppointment as any);
      prismaMock.appointment.update.mockResolvedValue({ ...mockAppointment, status: AppointmentStatus.CANCELED } as any);

      await service.cancelAppointment(appointmentId, user);

      expect(prismaMock.appointment.update).toHaveBeenCalledWith({
        where: { id: appointmentId },
        data: { status: AppointmentStatus.CANCELED },
      });
      // Verify resource release (setbit with 0)
      expect(redis.setbit).toHaveBeenCalledWith(expect.any(String), expect.any(Number), 0);
    });
  });
});
