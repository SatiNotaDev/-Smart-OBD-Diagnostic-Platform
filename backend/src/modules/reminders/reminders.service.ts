import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReminderDto } from './dto/create-reminder.dto';

@Injectable()
export class RemindersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(vehicleId: string, userId: string) {
    await this.verifyVehicleOwnership(vehicleId, userId);

    return this.prisma.reminder.findMany({
      where: { vehicleId },
      orderBy: [{ isCompleted: 'asc' }, { dueDate: 'asc' }],
    });
  }

  async create(userId: string, dto: CreateReminderDto) {
    await this.verifyVehicleOwnership(dto.vehicleId, userId);

    return this.prisma.reminder.create({
      data: {
        vehicleId: dto.vehicleId,
        title: dto.title,
        description: dto.description,
        type: dto.type as any,
        dueMileage: dto.dueMileage,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    });
  }

  async complete(id: string, userId: string) {
    const reminder = await this.findOne(id, userId);

    return this.prisma.reminder.update({
      where: { id },
      data: { isCompleted: true, completedAt: new Date() },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.reminder.delete({ where: { id } });
  }

  async getDueReminders(userId: string) {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { userId },
      select: { id: true, mileage: true },
    });

    const vehicleIds = vehicles.map((v) => v.id);

    const reminders = await this.prisma.reminder.findMany({
      where: {
        vehicleId: { in: vehicleIds },
        isCompleted: false,
        OR: [
          { dueDate: { lte: new Date() } },
          ...vehicles
            .filter((v) => v.mileage != null)
            .map((v) => ({
              vehicleId: v.id,
              dueMileage: { lte: v.mileage! },
            })),
        ],
      },
      include: { vehicle: { select: { brand: true, model: true } } },
    });

    return reminders;
  }

  private async findOne(id: string, userId: string) {
    const reminder = await this.prisma.reminder.findFirst({
      where: { id },
      include: { vehicle: { select: { userId: true } } },
    });

    if (!reminder || reminder.vehicle.userId !== userId) {
      throw new NotFoundException('Reminder not found');
    }

    return reminder;
  }

  private async verifyVehicleOwnership(vehicleId: string, userId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, userId },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }
}
