import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId: string,
    options?: {
      search?: string;
    },
  ) {
    const where: Prisma.ClientWhereInput = { userId };

    if (options?.search) {
      const search = options.search;
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.client.findMany({
      where,
      include: {
        vehicles: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            licensePlate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, userId },
      include: {
        vehicles: {
          include: {
            diagnostics: {
              orderBy: { createdAt: 'desc' },
              take: 5,
              select: {
                id: true,
                status: true,
                sourceType: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async create(userId: string, dto: CreateClientDto) {
    return this.prisma.client.create({
      data: {
        ...dto,
        userId,
      },
      include: {
        vehicles: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            licensePlate: true,
          },
        },
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateClientDto) {
    await this.findOne(id, userId);

    return this.prisma.client.update({
      where: { id },
      data: dto,
      include: {
        vehicles: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            licensePlate: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.client.delete({
      where: { id },
    });
  }

  async linkVehicle(clientId: string, vehicleId: string, userId: string) {
    await this.findOne(clientId, userId);

    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, userId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: { clientId },
    });
  }

  async unlinkVehicle(clientId: string, vehicleId: string, userId: string) {
    await this.findOne(clientId, userId);

    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, userId, clientId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found or not linked to this client');
    }

    return this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: { clientId: null },
    });
  }

  // ─── Client Notes CRUD ──────────────────────────────────────────────────────

  async findNotes(clientId: string, userId: string) {
    await this.findOne(clientId, userId);
    return this.prisma.clientNote.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createNote(clientId: string, userId: string, content: string) {
    await this.findOne(clientId, userId);
    return this.prisma.clientNote.create({
      data: { clientId, content },
    });
  }

  async updateNote(clientId: string, noteId: string, userId: string, content: string) {
    await this.findOne(clientId, userId);
    const note = await this.prisma.clientNote.findFirst({
      where: { id: noteId, clientId },
    });
    if (!note) throw new NotFoundException('Note not found');
    return this.prisma.clientNote.update({
      where: { id: noteId },
      data: { content },
    });
  }

  async deleteNote(clientId: string, noteId: string, userId: string) {
    await this.findOne(clientId, userId);
    const note = await this.prisma.clientNote.findFirst({
      where: { id: noteId, clientId },
    });
    if (!note) throw new NotFoundException('Note not found');
    return this.prisma.clientNote.delete({ where: { id: noteId } });
  }
}
