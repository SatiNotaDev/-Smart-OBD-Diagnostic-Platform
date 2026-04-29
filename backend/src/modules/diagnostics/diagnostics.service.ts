import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { enrichDtcCode } from './services/dtc-database';
import { AiAnalysisService } from './services/ai-analysis.service';

@Injectable()
export class DiagnosticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiAnalysis: AiAnalysisService,
  ) {}

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

    // AI-powered analysis
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: dto.vehicleId },
      select: { brand: true, model: true, year: true, engineType: true, mileage: true },
    });

    const aiResult = await this.aiAnalysis.analyze(enrichedDtcs, {
      brand: vehicle!.brand,
      model: vehicle!.model,
      year: vehicle!.year,
      engineType: vehicle!.engineType,
      mileage: vehicle!.mileage,
    });

    const fullSummary = [
      aiResult.summary,
      aiResult.rootCause ? `\nRoot cause: ${aiResult.rootCause}` : '',
      aiResult.correlations.length > 0 ? `\nCorrelations:\n${aiResult.correlations.map((c) => `• ${c}`).join('\n')}` : '',
      aiResult.actionPlan.length > 0 ? `\nAction plan:\n${aiResult.actionPlan.map((s, i) => `${i + 1}. ${s}`).join('\n')}` : '',
      aiResult.estimatedCost ? `\nEstimated cost: ${aiResult.estimatedCost}` : '',
    ].filter(Boolean).join('');

    await this.prisma.analysisResult.create({
      data: {
        sessionId: session.id,
        summary: fullSummary,
        confidence: aiResult.confidence,
      },
    });

    return this.findOne(session.id, userId);
  }

  async reanalyze(id: string, userId: string) {
    const session = await this.findOne(id, userId);

    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: session.vehicleId },
      select: { brand: true, model: true, year: true, engineType: true, mileage: true },
    });

    const dtcsWithSystem = session.dtcs.map((d) => {
      const enriched = enrichDtcCode(d.code, d.description, d.severity);
      return enriched;
    });

    const aiResult = await this.aiAnalysis.analyze(dtcsWithSystem, {
      brand: vehicle!.brand,
      model: vehicle!.model,
      year: vehicle!.year,
      engineType: vehicle!.engineType,
      mileage: vehicle!.mileage,
    });

    const fullSummary = [
      aiResult.summary,
      aiResult.rootCause ? `\nRoot cause: ${aiResult.rootCause}` : '',
      aiResult.correlations.length > 0 ? `\nCorrelations:\n${aiResult.correlations.map((c) => `• ${c}`).join('\n')}` : '',
      aiResult.actionPlan.length > 0 ? `\nAction plan:\n${aiResult.actionPlan.map((s, i) => `${i + 1}. ${s}`).join('\n')}` : '',
      aiResult.estimatedCost ? `\nEstimated cost: ${aiResult.estimatedCost}` : '',
    ].filter(Boolean).join('');

    // Upsert the analysis result
    await this.prisma.analysisResult.upsert({
      where: { sessionId: id },
      update: { summary: fullSummary, confidence: aiResult.confidence },
      create: { sessionId: id, summary: fullSummary, confidence: aiResult.confidence },
    });

    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.diagnosticSession.delete({ where: { id } });
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
