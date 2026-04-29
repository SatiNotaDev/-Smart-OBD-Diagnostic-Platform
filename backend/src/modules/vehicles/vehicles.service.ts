import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Prisma } from '@prisma/client';

const PLAN_VEHICLE_LIMITS: Record<string, number> = {
  FREE: 3,
  PRO: 15,
  BUSINESS: Infinity,
};

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId: string,
    options?: {
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const where: Prisma.VehicleWhereInput = { userId };

    if (options?.search) {
      const search = options.search;
      where.OR = [
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { vin: { contains: search, mode: 'insensitive' } },
        { licensePlate: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.VehicleOrderByWithRelationInput = {};
    const sortBy = options?.sortBy || 'createdAt';
    const sortOrder = options?.sortOrder || 'desc';
    orderBy[sortBy] = sortOrder;

    return this.prisma.vehicle.findMany({
      where,
      orderBy,
    });
  }

  async findOne(id: string, userId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, userId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async create(userId: string, dto: CreateVehicleDto, userPlan?: string) {
    const plan = userPlan || 'FREE';
    const limit = PLAN_VEHICLE_LIMITS[plan] ?? PLAN_VEHICLE_LIMITS.FREE;

    const currentCount = await this.prisma.vehicle.count({ where: { userId } });

    if (currentCount >= limit) {
      throw new ForbiddenException(
        `Vehicle limit reached (${limit} for ${plan} plan). Upgrade your plan to add more vehicles.`,
      );
    }

    return this.prisma.vehicle.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateVehicleDto) {
    await this.findOne(id, userId);

    return this.prisma.vehicle.update({
      where: { id, userId },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.vehicle.delete({
      where: { id, userId },
    });
  }

  async addPhoto(id: string, userId: string, photoUrl: string) {
    const vehicle = await this.findOne(id, userId);

    return this.prisma.vehicle.update({
      where: { id, userId },
      data: {
        photos: { push: photoUrl },
      },
    });
  }

  async removePhoto(id: string, userId: string, photoUrl: string) {
    const vehicle = await this.findOne(id, userId);

    return this.prisma.vehicle.update({
      where: { id, userId },
      data: {
        photos: vehicle.photos.filter((p) => p !== photoUrl),
      },
    });
  }
}
