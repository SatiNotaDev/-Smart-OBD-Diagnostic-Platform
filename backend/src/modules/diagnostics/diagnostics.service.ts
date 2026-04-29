import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { enrichDtcCode } from './services/dtc-database';

@Injectable()
export class DiagnosticsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(vehicleId: string, userId: string) {
    await this.verifyVehicleOwnership(vehicleId, userId);

    return this.prisma.diagnosticSession.findMany({
      where: { vehicleId },
      include: {
        dtcs: true,
        _count: { select: { metrics: true, dtcs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const session = await this.prisma.diagnosticSession.findFirst({
      where: { id },
      include: {
        vehicle: { select: { userId: true, brand: true, model: true, year: true, vin: true, mileage: true, engineType: true } },
        dtcs: true,
        metrics: true,
        result: true,
      },
    });

    if (!session || session.vehicle.userId !== userId) {
      throw new NotFoundException('Diagnostic session not found');
    }

    return session;
  }

  async create(userId: string, dto: CreateSessionDto) {
    await this.verifyVehicleOwnership(dto.vehicleId, userId);

    const enrichedDtcs = dto.dtcs.map((d) =>
      enrichDtcCode(d.code, d.description, d.severity),
    );

    const session = await this.prisma.diagnosticSession.create({
      data: {
        vehicleId: dto.vehicleId,
        sourceType: (dto.sourceType as any) || 'MANUAL',
        status: 'COMPLETED',
        dtcs: {
          create: enrichedDtcs.map((d) => ({
            code: d.code,
            description: d.description,
            severity: d.severity,
          })),
        },
        metrics: dto.metrics?.length
          ? {
              create: dto.metrics.map((m) => ({
                name: m.name,
                value: m.value,
                unit: m.unit || '',
                timestamp: new Date(),
              })),
            }
          : undefined,
      },
      include: {
        dtcs: true,
        metrics: true,
      },
    });

    // Generate summary
    const maxSeverity = Math.max(...enrichedDtcs.map((d) => d.severity));
    const systems = [...new Set(enrichedDtcs.map((d) => d.system))];

    await this.prisma.analysisResult.create({
      data: {
        sessionId: session.id,
        summary: this.generateSummary(enrichedDtcs, systems, maxSeverity),
        confidence: this.calculateConfidence(enrichedDtcs),
      },
    });

    return this.findOne(session.id, userId);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.diagnosticSession.delete({ where: { id } });
  }

  private generateSummary(
    dtcs: Array<{ code: string; description: string; severity: number; system: string }>,
    systems: string[],
    maxSeverity: number,
  ): string {
    const count = dtcs.length;
    const critical = dtcs.filter((d) => d.severity >= 4).length;

    let urgency = 'low';
    if (maxSeverity >= 5) urgency = 'critical';
    else if (maxSeverity >= 4) urgency = 'high';
    else if (maxSeverity >= 3) urgency = 'moderate';

    const parts = [
      `Found ${count} DTC code${count > 1 ? 's' : ''}.`,
      `Affected systems: ${systems.join(', ')}.`,
    ];

    if (critical > 0) {
      parts.push(`${critical} critical/high severity issue${critical > 1 ? 's' : ''} requiring immediate attention.`);
    }

    parts.push(`Overall urgency: ${urgency}.`);
    return parts.join(' ');
  }

  private calculateConfidence(
    dtcs: Array<{ code: string; description: string; severity: number; system: string }>,
  ): number {
    const knownCount = dtcs.filter((d) => d.description !== 'Unknown DTC code').length;
    return dtcs.length > 0 ? knownCount / dtcs.length : 0;
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
