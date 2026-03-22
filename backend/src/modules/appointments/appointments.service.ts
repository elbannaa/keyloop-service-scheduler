import dayjs from 'dayjs';
import prisma from '../../lib/prisma';
import { AppError } from '../auth/auth.service';
import { ServiceType, AppointmentStatus } from '@prisma/client';

interface CreateAppointmentInput {
  dealershipId: string;
  serviceType: ServiceType;
  startTime: Date;
  customerName: string;
  customerEmail: string;
  vehicleInfo?: string;
  vehicleId?: string; // Optional if customer selects a specific system vehicle
}

export class AppointmentsService {
  private getDuration(type: ServiceType): number {
    switch (type) {
      case ServiceType.SALES_CONSULTATION:
        return 60; // Defaulting to 60 for simplicity, can be dynamic
      case ServiceType.DETAILED_CONSULTATION:
        return 90;
      case ServiceType.REPAIR_MAINTENANCE:
        return 60;
      default:
        return 60;
    }
  }

  async listAvailability(dealershipId: string, serviceType: ServiceType, date: Date) {
    const duration = this.getDuration(serviceType);
    const dayStart = dayjs(date).startOf('day');
    const dayEnd = dayjs(date).endOf('day');

    // Get all technicians and system vehicles for this dealership
    const technicians = await prisma.technician.findMany({
      where: { dealershipId, isActive: true },
    });

    const vehicles = await prisma.vehicle.findMany({
      where: { dealershipId },
    });

    // Get all existing appointments for this dealership on this day, excluding canceled ones
    const appointments = await prisma.appointment.findMany({
      where: {
        dealershipId,
        startTime: { gte: dayStart.toDate(), lte: dayEnd.toDate() },
        status: { not: AppointmentStatus.CANCELED },
      },
    });

    const availableSlots: Date[] = [];
    
    // Work hours: 8 AM to 6 PM
    let currentSlot = dayStart.hour(8).minute(0).second(0);
    const workEnd = dayStart.hour(18).minute(0).second(0);

    while (currentSlot.add(duration, 'minute').isBefore(workEnd) || currentSlot.add(duration, 'minute').format('HH:mm') === '18:00') {
      const slotEnd = currentSlot.add(duration, 'minute');

      // Check if any technician is free
      const freeTechnicians = technicians.filter(tech => {
        // Better overlap check: (StartA < EndB) and (EndA > StartB)
        const hasOverlap = appointments.some(app => 
          app.technicianId === tech.id &&
          currentSlot.isBefore(dayjs(app.endTime)) && slotEnd.isAfter(dayjs(app.startTime))
        );
        return !hasOverlap;
      });

      let isAvailable = freeTechnicians.length > 0;

      // If Detailed Consultation, check if any vehicle is free
      if (serviceType === ServiceType.DETAILED_CONSULTATION) {
        const freeVehicles = vehicles.filter(v => {
          const hasOverlap = appointments.some(app => 
            app.vehicleId === v.id &&
            currentSlot.isBefore(dayjs(app.endTime)) && slotEnd.isAfter(dayjs(app.startTime))
          );
          return !hasOverlap;
        });
        isAvailable = isAvailable && freeVehicles.length > 0;
      }

      if (isAvailable) {
        availableSlots.push(currentSlot.toDate());
      }

      currentSlot = currentSlot.add(30, 'minute'); // 30 min intervals
    }

    return availableSlots;
  }

  async createAppointment(input: CreateAppointmentInput) {
    const duration = this.getDuration(input.serviceType);
    const endTime = dayjs(input.startTime).add(duration, 'minute').toDate();

    // Verify dealership exists
    const dealership = await prisma.dealership.findUnique({
      where: { id: input.dealershipId },
      include: { technicians: { where: { isActive: true } }, vehicles: true },
    });

    if (!dealership) throw new AppError(404, 'Dealership not found');

    // Get overlapping appointments that are not canceled
    const overlapping = await prisma.appointment.findMany({
      where: {
        dealershipId: input.dealershipId,
        startTime: { lt: endTime },
        endTime: { gt: input.startTime },
        status: { not: AppointmentStatus.CANCELED },
      },
    });

    // Find available technician
    const usedTechIds = new Set(overlapping.map(a => a.technicianId));
    const availableTech = dealership.technicians.find(t => !usedTechIds.has(t.id));

    if (!availableTech) {
      throw new AppError(400, 'No technicians available for this time slot');
    }

    let assignedVehicleId: string | null = null;

    if (input.serviceType === ServiceType.DETAILED_CONSULTATION) {
      const usedVehicleIds = new Set(overlapping.filter(a => a.vehicleId).map(a => a.vehicleId!));
      const availableVehicle = dealership.vehicles.find(v => !usedVehicleIds.has(v.id));

      if (!availableVehicle) {
        throw new AppError(400, 'No vehicles available for this time slot');
      }
      assignedVehicleId = availableVehicle.id;
    }

    const appointment = await prisma.appointment.create({
      data: {
        serviceType: input.serviceType,
        startTime: input.startTime,
        endTime,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        vehicleInfo: input.vehicleInfo,
        dealershipId: input.dealershipId,
        technicianId: availableTech.id,
        vehicleId: assignedVehicleId,
      },
      include: {
        technician: true,
        vehicle: true,
        dealership: true,
      },
    });

    return appointment;
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

  async cancelAppointment(id: string) {
    return prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CANCELED },
    });
  }
}
