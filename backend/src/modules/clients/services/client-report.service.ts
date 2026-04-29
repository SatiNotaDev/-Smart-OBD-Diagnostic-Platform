import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class ClientReportService {
  constructor(private readonly prisma: PrismaService) {}

  async generateReport(clientId: string, userId: string, sessionIds: string[]) {
    const client = await this.prisma.client.findFirst({
      where: { id: clientId, userId },
      include: { vehicles: { select: { id: true, brand: true, model: true, year: true, mileage: true, engineType: true } } },
    });

    if (!client) throw new NotFoundException('Client not found');

    const sessions = await this.prisma.diagnosticSession.findMany({
      where: {
        id: { in: sessionIds },
        vehicleId: { in: client.vehicles.map((v) => v.id) },
      },
      include: {
        vehicle: { select: { brand: true, model: true, year: true, mileage: true } },
        dtcs: true,
        metrics: true,
        result: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (sessions.length === 0) {
      throw new NotFoundException('No diagnostic sessions found');
    }

    const reportData = sessions.map((s) => ({
      date: s.createdAt,
      vehicle: `${s.vehicle.brand} ${s.vehicle.model} (${s.vehicle.year})`,
      mileage: s.vehicle.mileage,
      status: s.status,
      dtcs: s.dtcs.map((d) => ({ code: d.code, description: d.description, severity: d.severity })),
      metrics: s.metrics.map((m) => ({ name: m.name, value: m.value, unit: m.unit })),
      analysis: s.result?.summary || null,
    }));

    const report = await this.buildReport(client.name, reportData);

    return { report, generatedAt: new Date().toISOString(), sessionCount: sessions.length };
  }

  private async buildReport(
    clientName: string,
    sessions: Array<{
      date: Date;
      vehicle: string;
      mileage: number | null;
      status: string;
      dtcs: Array<{ code: string; description: string; severity: number }>;
      metrics: Array<{ name: string; value: number; unit: string | null }>;
      analysis: string | null;
    }>,
  ): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return this.buildFallbackReport(clientName, sessions);
    }

    const anthropic = new Anthropic({ apiKey });

    const sessionSummaries = sessions.map((s, i) => {
      let summary = `Session ${i + 1} — ${new Date(s.date).toLocaleDateString()} | ${s.vehicle}${s.mileage ? ` (${s.mileage.toLocaleString()} km)` : ''}\n`;
      summary += `Status: ${s.status}\n`;
      if (s.dtcs.length > 0) {
        summary += `DTC Codes:\n`;
        s.dtcs.forEach((d) => { summary += `  - ${d.code}: ${d.description} (severity ${d.severity}/5)\n`; });
      }
      if (s.metrics.length > 0) {
        summary += `Metrics: ${s.metrics.map((m) => `${m.name}=${m.value}${m.unit || ''}`).join(', ')}\n`;
      }
      if (s.analysis) {
        summary += `Previous analysis: ${s.analysis}\n`;
      }
      return summary;
    }).join('\n---\n');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6-20250514',
      max_tokens: 2048,
      system: `You are a professional automotive diagnostic report writer. Generate a clear, professional client-facing diagnostic report in markdown format. The report should be understandable by a non-technical vehicle owner but also useful for mechanics. Include:
- Executive summary (2-3 sentences)
- Issues found (prioritized by severity)
- Recommendations (what to fix immediately vs. monitor)
- Estimated urgency level for each issue
Write in the same language as the DTC descriptions. If descriptions are in English, write in English. Be concise and professional.`,
      messages: [{
        role: 'user',
        content: `Generate a diagnostic report for client "${clientName}" based on these diagnostic sessions:\n\n${sessionSummaries}`,
      }],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    return textBlock?.text || this.buildFallbackReport(clientName, sessions);
  }

  private buildFallbackReport(
    clientName: string,
    sessions: Array<{
      date: Date;
      vehicle: string;
      mileage: number | null;
      dtcs: Array<{ code: string; description: string; severity: number }>;
      metrics: Array<{ name: string; value: number; unit: string | null }>;
      analysis: string | null;
    }>,
  ): string {
    const allDtcs = sessions.flatMap((s) => s.dtcs);
    const critical = allDtcs.filter((d) => d.severity >= 4);
    const moderate = allDtcs.filter((d) => d.severity >= 2 && d.severity < 4);
    const minor = allDtcs.filter((d) => d.severity < 2);

    let report = `# Diagnostic Report\n\n`;
    report += `**Client:** ${clientName}\n`;
    report += `**Date:** ${new Date().toLocaleDateString()}\n`;
    report += `**Sessions analyzed:** ${sessions.length}\n\n`;

    report += `## Summary\n\n`;
    report += `Total issues found: ${allDtcs.length} DTC codes across ${sessions.length} diagnostic session(s).\n\n`;

    if (critical.length > 0) {
      report += `## ⚠️ Critical Issues (Immediate Attention)\n\n`;
      critical.forEach((d) => { report += `- **${d.code}**: ${d.description}\n`; });
      report += `\n`;
    }

    if (moderate.length > 0) {
      report += `## Moderate Issues (Schedule Service)\n\n`;
      moderate.forEach((d) => { report += `- **${d.code}**: ${d.description}\n`; });
      report += `\n`;
    }

    if (minor.length > 0) {
      report += `## Minor Issues (Monitor)\n\n`;
      minor.forEach((d) => { report += `- **${d.code}**: ${d.description}\n`; });
      report += `\n`;
    }

    report += `## Vehicles\n\n`;
    const vehicles = [...new Set(sessions.map((s) => s.vehicle))];
    vehicles.forEach((v) => { report += `- ${v}\n`; });

    report += `\n---\n*Report generated automatically. Professional inspection recommended for critical issues.*\n`;

    return report;
  }
}
