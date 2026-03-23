import dayjs from 'dayjs';
import prisma from '@/lib/prisma';
import { AppError } from '@/modules/auth/auth.service';
import { ServiceType, AppointmentStatus, Role } from '@prisma/client';
import redis, { getRedisKey, getSlotRange } from '@/lib/redis';

interface CreateAppointmentInput {
  dealershipId: string;
  serviceType: ServiceType;
  startTime: Date;
  endTime: Date;
  customerName: string;
  customerEmail: string;
  vehicleInfo?: string;
  vehicleId?: string;
}

export class AppointmentsService {
  private async getAvailableResource(
    dealershipId: string,
    dateStr: string,
    type: 'tech' | 'bay',
    resourceIds: string[],
    slots: number[]
  ): Promise<string | null> {
    for (const id of resourceIds) {
      const key = getRedisKey.busySlots(dealershipId, dateStr, type, id);
      let isFree = true;
      for (const slot of slots) {
        if ((await redis.getbit(key, slot)) === 1) {
          isFree = false;
          break;
        }
      }
      if (isFree) return id;
    }
    return null;
  }

  private async markSlots(
    dealershipId: string,
    dateStr: string,
    type: 'tech' | 'bay',
    resourceId: string,
    slots: number[],
    isBusy: boolean
  ) {
    const key = getRedisKey.busySlots(dealershipId, dateStr, type, resourceId);
    for (const slot of slots) {
      await redis.setbit(key, slot, isBusy ? 1 : 0);
    }
  }

  async listAppointments(filters: {
    userId: string;
    userRole: string;
    userEmail: string;
    dealershipId?: string;
    status?: AppointmentStatus;
    date?: Date;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    // Role-based access control
    if (filters.userRole === 'USER') {
      where.customerEmail = filters.userEmail;
    } else if (filters.dealershipId) {
      where.dealershipId = filters.dealershipId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate && filters.endDate) {
      where.startTime = {
        gte: dayjs(filters.startDate).startOf('day').toDate(),
        lte: dayjs(filters.endDate).endOf('day').toDate(),
      };
    } else if (filters.date) {
      const dayStart = dayjs(filters.date).startOf('day');
      const dayEnd = dayjs(filters.date).endOf('day');
      where.startTime = {
        gte: dayStart.toDate(),
        lte: dayEnd.toDate(),
      };
    }

    return prisma.appointment.findMany({
      where,
      include: {
        dealership: true,
        technician: true,
        vehicle: true,
      },
      orderBy: {
        startTime: 'desc',
      },
    });
  }

  async createAppointment(input: CreateAppointmentInput) {
    const startTime = dayjs(input.startTime);
    const endTime = dayjs(input.endTime);
    const dateStr = startTime.format('YYYY-MM-DD');

    // Basic validation
    if (startTime.isBefore(dayjs())) {
      throw new AppError(400, 'Appointments must be booked for a future time');
    }
    if (endTime.isBefore(startTime) || endTime.isSame(startTime)) {
      throw new AppError(400, 'End time must be after start time');
    }
    if (endTime.diff(startTime, 'hour', true) > 4) {
      throw new AppError(400, 'Appointment duration cannot exceed 4 hours');
    }

    const slots = getSlotRange(input.startTime, input.endTime);
    if (slots.length === 0) throw new AppError(400, 'Invalid time range');

    // Check for overlapping appointments for the same user
    const existingOverlap = await prisma.appointment.findFirst({
      where: {
        customerEmail: input.customerEmail,
        status: { notIn: [AppointmentStatus.CANCELED, AppointmentStatus.REJECTED] },
        AND: [
          { startTime: { lt: endTime.toDate() } },
          { endTime: { gt: startTime.toDate() } },
        ],
      },
    });

    if (existingOverlap) {
      throw new AppError(400, 'You already have an appointment scheduled during this time range');
    }

    // Verify dealership exists
    const dealership = await prisma.dealership.findUnique({
      where: { id: input.dealershipId },
      include: { technicians: { where: { isActive: true } }, vehicles: true },
    });

    if (!dealership) throw new AppError(404, 'Dealership not found');

    // Find available technician via Redis
    const techId = await this.getAvailableResource(
      input.dealershipId,
      dateStr,
      'tech',
      dealership.technicians.map(t => t.id),
      slots
    );

    if (!techId) {
      throw new AppError(400, 'No technicians available for this time slot');
    }

    // Find available vehicle bay via Redis
    const bayId = await this.getAvailableResource(
      input.dealershipId,
      dateStr,
      'bay',
      dealership.vehicles.map(v => v.id),
      slots
    );

    if (!bayId) {
      throw new AppError(400, 'No vehicle slots (bays) available for this time slot');
    }

    // Create appointment with PENDING status (requires manager approval)
    const appointment = await prisma.appointment.create({
      data: {
        serviceType: input.serviceType,
        status: AppointmentStatus.PENDING,
        startTime: startTime.toDate(),
        endTime: endTime.toDate(),
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        vehicleInfo: input.vehicleInfo,
        dealershipId: input.dealershipId,
        technicianId: techId,
        vehicleId: bayId,
      },
      include: {
        technician: true,
        vehicle: true,
        dealership: true,
      },
    });

    // Mark slots as busy in Redis
    await this.markSlots(input.dealershipId, dateStr, 'tech', techId, slots, true);
    await this.markSlots(input.dealershipId, dateStr, 'bay', bayId, slots, true);

    // TODO: Send email to manager for approval
    console.log(`Email request sent to manager for appointment ${appointment.id}`);

    return appointment;
  }

  async updateAppointment(id: string, data: { status?: AppointmentStatus; technicianId?: string }) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { technician: true }
    });
    if (!appointment) throw new AppError(404, 'Appointment not found');

    const dateStr = dayjs(appointment.startTime).format('YYYY-MM-DD');
    const slots = getSlotRange(appointment.startTime, appointment.endTime);
    const updateData: any = { ...data };

    // Handle technician change
    if (data.technicianId && data.technicianId !== appointment.technicianId) {
      // 1. Verify new technician availability
      const isAvailable = await this.getAvailableResource(
        appointment.dealershipId,
        dateStr,
        'tech',
        [data.technicianId],
        slots
      );
      if (!isAvailable) {
        throw new AppError(400, 'Selected technician is not available for this time slot');
      }

      // 2. Clear old technician slots in Redis
      await this.markSlots(appointment.dealershipId, dateStr, 'tech', appointment.technicianId, slots, false);

      // 3. Mark new technician slots in Redis
      await this.markSlots(appointment.dealershipId, dateStr, 'tech', data.technicianId, slots, true);
    }

    // Handle status changes (releasing resources if CANCELED or REJECTED)
    if (data.status && (data.status === AppointmentStatus.CANCELED || data.status === AppointmentStatus.REJECTED)) {
      await this.markSlots(appointment.dealershipId, dateStr, 'tech', data.technicianId || appointment.technicianId, slots, false);
      if (appointment.vehicleId) {
        await this.markSlots(appointment.dealershipId, dateStr, 'bay', appointment.vehicleId, slots, false);
      }
    }

    return prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        technician: true,
        dealership: true,
        vehicle: true,
      }
    });
  }

  async cancelAppointment(id: string, user: { id: string, role: string, email: string }) {
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) throw new AppError(404, 'Appointment not found');

    // Authorization check
    if (user.role === Role.USER && appointment.customerEmail !== user.email) {
      throw new AppError(403, 'You are not authorized to cancel this appointment');
    }

    const dateStr = dayjs(appointment.startTime).format('YYYY-MM-DD');
    const slots = getSlotRange(appointment.startTime, appointment.endTime);

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CANCELED },
    });

    // Clear slots in Redis
    await this.markSlots(appointment.dealershipId, dateStr, 'tech', appointment.technicianId, slots, false);
    if (appointment.vehicleId) {
      await this.markSlots(appointment.dealershipId, dateStr, 'bay', appointment.vehicleId, slots, false);
    }

    return updated;
  }

  async getDealershipSchedule(dealershipId: string, date: Date) {
    const dayStart = dayjs(date).startOf('day');
    const dayEnd = dayjs(date).endOf('day');

    const technicians = await prisma.technician.findMany({
      where: { dealershipId, isActive: true },
      include: {
        appointments: {
          where: {
            startTime: { gte: dayStart.toDate(), lte: dayEnd.toDate() },
            status: { not: AppointmentStatus.CANCELED },
          },
          orderBy: { startTime: 'asc' },
        },
      },
    });

    return technicians;
  }

  async checkAvailability(dealershipId: string, startTime: Date, endTime: Date): Promise<boolean> {
    const start = dayjs(startTime);
    const dateStr = start.format('YYYY-MM-DD');

    const slots = getSlotRange(startTime, endTime);
    if (slots.length === 0) return false;

    const { isActive, techIds, bayIds } = await this.getResources(dealershipId);
    if (!isActive) return false;

    // Check technician availability
    const techId = await this.getAvailableResource(
      dealershipId,
      dateStr,
      'tech',
      techIds,
      slots
    );
    if (!techId) return false;

    // Check bay availability
    const bayId = await this.getAvailableResource(
      dealershipId,
      dateStr,
      'bay',
      bayIds,
      slots
    );


    return !!bayId;
  }

  private async getResources(dealershipId: string): Promise<{ isActive: boolean; techIds: string[]; bayIds: string[] }> {
    const activeKey = getRedisKey.dealerActive(dealershipId);
    const techsKey = getRedisKey.dealerTechs(dealershipId);
    const baysKey = getRedisKey.dealerBays(dealershipId);

    const cachedActive = await redis.get(activeKey);

    if (cachedActive !== null) {
      if (cachedActive === 'false') return { isActive: false, techIds: [], bayIds: [] };

      const [techIds, bayIds] = await Promise.all([
        redis.smembers(techsKey),
        redis.smembers(baysKey)
      ]);

      return { isActive: true, techIds, bayIds };
    }

    // Cache miss: sync from DB
    const dealership = await prisma.dealership.findUnique({
      where: { id: dealershipId },
      include: {
        technicians: { where: { isActive: true }, select: { id: true } },
        vehicles: { select: { id: true } }
      },
    });

    if (!dealership || !dealership.isActive) {
      await redis.set(activeKey, 'false', 'EX', 3600); // 1 hour
      return { isActive: false, techIds: [], bayIds: [] };
    }

    const techIds = dealership.technicians.map(t => t.id);
    const bayIds = dealership.vehicles.map(v => v.id);

    // Populate Redis
    const pipeline = redis.pipeline();
    pipeline.set(activeKey, 'true', 'EX', 3600);
    pipeline.del(techsKey);
    pipeline.del(baysKey);
    if (techIds.length > 0) pipeline.sadd(techsKey, ...techIds);
    if (bayIds.length > 0) pipeline.sadd(baysKey, ...bayIds);
    pipeline.expire(techsKey, 3600);
    pipeline.expire(baysKey, 3600);
    await pipeline.exec();

    return { isActive: true, techIds, bayIds };
  }
}
