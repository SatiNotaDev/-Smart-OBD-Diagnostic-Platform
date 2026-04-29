import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(vehicleId: string, userId: string) {
    await this.verifyVehicleOwnership(vehicleId, userId);

    return this.prisma.note.findMany({
      where: { vehicleId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const note = await this.prisma.note.findFirst({
      where: { id },
      include: { vehicle: { select: { userId: true } } },
    });

    if (!note || note.vehicle.userId !== userId) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  async create(vehicleId: string, userId: string, dto: CreateNoteDto) {
    await this.verifyVehicleOwnership(vehicleId, userId);

    return this.prisma.note.create({
      data: {
        vehicleId,
        title: dto.title,
        content: dto.content,
        category: (dto.category as any) || 'GENERAL',
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateNoteDto) {
    await this.findOne(id, userId);

    return this.prisma.note.update({
      where: { id },
      data: dto as any,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.note.delete({
      where: { id },
    });
  }

  private async verifyVehicleOwnership(vehicleId: string, userId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, userId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }
}
