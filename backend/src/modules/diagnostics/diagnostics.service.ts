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

  async getStats(userId: string) {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { userId },
      select: { id: true, brand: true, model: true },
    });

    const vehicleIds = vehicles.map((v) => v.id);

    const [vehicleCount, sessionCount, dtcCount, recentSessions, allDtcs] = await Promise.all([
      this.prisma.vehicle.count({ where: { userId } }),
      this.prisma.diagnosticSession.count({ where: { vehicleId: { in: vehicleIds } } }),
      this.prisma.dtcCode.count({
        where: { session: { vehicleId: { in: vehicleIds } } },
      }),
      this.prisma.diagnosticSession.findMany({
        where: { vehicleId: { in: vehicleIds } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          vehicle: { select: { brand: true, model: true } },
          dtcs: { select: { code: true, severity: true } },
          result: { select: { confidence: true } },
          _count: { select: { dtcs: true } },
        },
      }),
      this.prisma.dtcCode.findMany({
        where: { session: { vehicleId: { in: vehicleIds } } },
        select: { code: true, severity: true },
      }),
    ]);

    // Monthly diagnostics (last 6 months)
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const monthlyStats = await this.prisma.diagnosticSession.groupBy({
      by: ['createdAt'],
      where: {
        vehicleId: { in: vehicleIds },
        createdAt: { gte: sixMonthsAgo },
      },
      _count: true,
    });

    const monthlyMap: Record<string, number> = {};
    for (const entry of monthlyStats) {
      const key = `${entry.createdAt.getFullYear()}-${String(entry.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + entry._count;
    }

    // Severity distribution
    const severityDistribution = [0, 0, 0, 0, 0]; // severity 1-5
    for (const dtc of allDtcs) {
      const idx = Math.min(Math.max((dtc.severity || 1) - 1, 0), 4);
      severityDistribution[idx]++;
    }

    // Top recurring DTC codes
    const dtcFrequency: Record<string, number> = {};
    for (const dtc of allDtcs) {
      dtcFrequency[dtc.code] = (dtcFrequency[dtc.code] || 0) + 1;
    }
    const topDtcs = Object.entries(dtcFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([code, count]) => ({ code, count }));

    // DTC by system category (P=Powertrain, B=Body, C=Chassis, U=Network)
    const systemBreakdown = { P: 0, B: 0, C: 0, U: 0 };
    for (const dtc of allDtcs) {
      const prefix = dtc.code.charAt(0).toUpperCase() as keyof typeof systemBreakdown;
      if (prefix in systemBreakdown) systemBreakdown[prefix]++;
    }

    // Health score (0-100): based on severity weighted DTCs relative to sessions
    let healthScore = 100;
    if (sessionCount > 0) {
      const weightedSeverity = allDtcs.reduce((sum, d) => sum + (d.severity || 1), 0);
      const avgSeverityPerSession = weightedSeverity / sessionCount;
      healthScore = Math.max(0, Math.round(100 - avgSeverityPerSession * 8));
    }

    // Sessions per vehicle
    const sessionsPerVehicle = await this.prisma.diagnosticSession.groupBy({
      by: ['vehicleId'],
      where: { vehicleId: { in: vehicleIds } },
      _count: true,
    });

    const vehicleActivity = sessionsPerVehicle.map((s) => {
      const v = vehicles.find((veh) => veh.id === s.vehicleId);
      return {
        vehicle: v ? `${v.brand} ${v.model}` : 'Unknown',
        sessions: s._count,
      };
    }).sort((a, b) => b.sessions - a.sessions);

    return {
      vehicleCount,
      sessionCount,
      dtcCount,
      healthScore,
      recentSessions,
      monthlyDiagnostics: Object.entries(monthlyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({ month, count })),
      severityDistribution,
      topDtcs,
      systemBreakdown,
      vehicleActivity,
    };
  }

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
