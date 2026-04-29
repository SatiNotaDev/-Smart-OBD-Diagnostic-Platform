import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

interface DtcInput {
  code: string;
  description: string;
  severity: number;
  system: string;
}

interface VehicleContext {
  brand: string;
  model: string;
  year: number;
  engineType: string;
  mileage: number | null;
}

export interface AiAnalysisResult {
  summary: string;
  rootCause: string;
  correlations: string[];
  repairPriority: Array<{ code: string; priority: number; reason: string }>;
  estimatedCost: string;
  actionPlan: string[];
  confidence: number;
}

@Injectable()
export class AiAnalysisService {
  private readonly logger = new Logger(AiAnalysisService.name);
  private readonly client: Anthropic | null;

  constructor() {
    this.client = process.env.ANTHROPIC_API_KEY
      ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      : null;

    if (!this.client) {
      this.logger.warn('ANTHROPIC_API_KEY not set — AI analysis will use fallback');
    }
  }

  async analyze(dtcs: DtcInput[], vehicle: VehicleContext): Promise<AiAnalysisResult> {
    if (!this.client) {
      return this.fallbackAnalysis(dtcs, vehicle);
    }

    const systemPrompt = `You are an expert automotive diagnostic engineer. Analyze OBD-II DTC codes and provide a structured diagnostic report.

Vehicle: ${vehicle.brand} ${vehicle.model} (${vehicle.year}, ${vehicle.engineType}${vehicle.mileage ? `, ${vehicle.mileage.toLocaleString()} km` : ''})

Rules:
- Identify correlations between codes (codes that likely share a root cause)
- Prioritize repairs by safety impact and cost-effectiveness
- Consider vehicle age, mileage, and engine type
- Give realistic cost estimates (ranges)
- Provide a clear step-by-step action plan
- Be concise and practical

Respond ONLY in valid JSON matching this structure:
{
  "summary": "2-3 sentence overall assessment",
  "rootCause": "Most likely root cause connecting multiple codes",
  "correlations": ["Code X + Code Y likely caused by Z", ...],
  "repairPriority": [{"code": "P0XXX", "priority": 1, "reason": "why first"}, ...],
  "estimatedCost": "Overall repair cost range (e.g. $200-$800)",
  "actionPlan": ["Step 1: ...", "Step 2: ...", ...],
  "confidence": 0.85
}`;

    const userMessage = `Analyze these DTC codes:\n\n${dtcs.map((d) => `- ${d.code}: ${d.description} (severity: ${d.severity}/5, system: ${d.system})`).join('\n')}`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-6-20250514',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      });

      const text = response.content.find((b) => b.type === 'text')?.text || '';
      const parsed = JSON.parse(text) as AiAnalysisResult;

      return {
        summary: parsed.summary || '',
        rootCause: parsed.rootCause || '',
        correlations: parsed.correlations || [],
        repairPriority: parsed.repairPriority || [],
        estimatedCost: parsed.estimatedCost || '',
        actionPlan: parsed.actionPlan || [],
        confidence: parsed.confidence || 0.7,
      };
    } catch (error) {
      this.logger.error(`AI analysis failed: ${error.message}`);
      return this.fallbackAnalysis(dtcs, vehicle);
    }
  }

  private fallbackAnalysis(dtcs: DtcInput[], vehicle: VehicleContext): AiAnalysisResult {
    const critical = dtcs.filter((d) => d.severity >= 4);
    const systems = [...new Set(dtcs.map((d) => d.system))];
    const maxSev = Math.max(...dtcs.map((d) => d.severity));

    let urgency = 'low';
    if (maxSev >= 5) urgency = 'critical';
    else if (maxSev >= 4) urgency = 'high';
    else if (maxSev >= 3) urgency = 'moderate';

    const correlations: string[] = [];

    // Basic correlation detection
    const hasMisfire = dtcs.some((d) => d.code.startsWith('P030'));
    const hasLean = dtcs.some((d) => ['P0171', 'P0174'].includes(d.code));
    const hasRich = dtcs.some((d) => ['P0172', 'P0175'].includes(d.code));
    const hasMAF = dtcs.some((d) => d.code.startsWith('P010'));
    const hasO2 = dtcs.some((d) => d.code.startsWith('P013'));

    if (hasMisfire && hasLean) {
      correlations.push('Misfire + lean condition — likely vacuum leak or fuel delivery issue');
    }
    if (hasMisfire && hasMAF) {
      correlations.push('Misfire + MAF issue — check MAF sensor and air intake for leaks');
    }
    if (hasLean && hasO2) {
      correlations.push('Lean condition + O2 sensor — may be caused by exhaust leak before sensor');
    }
    if (hasRich && hasO2) {
      correlations.push('Rich condition + O2 sensor — possible faulty injector or fuel pressure regulator');
    }

    const repairPriority = dtcs
      .sort((a, b) => b.severity - a.severity)
      .map((d, i) => ({
        code: d.code,
        priority: i + 1,
        reason: d.severity >= 4 ? 'Safety/driveability impact' : 'Emissions/efficiency',
      }));

    const actionPlan = [
      'Read freeze frame data for context',
      ...(critical.length > 0
        ? [`Address critical codes first: ${critical.map((d) => d.code).join(', ')}`]
        : []),
      'Check for Technical Service Bulletins (TSBs) for this model',
      'Clear codes and test drive to confirm persistent faults',
      'Repair in priority order and re-scan after each fix',
    ];

    return {
      summary: `Found ${dtcs.length} code(s) affecting ${systems.join(', ')}. Overall urgency: ${urgency}. ${critical.length > 0 ? `${critical.length} critical issue(s) need immediate attention.` : ''}`,
      rootCause: correlations.length > 0
        ? correlations[0]
        : `${systems[0]} system malfunction — further diagnosis needed`,
      correlations,
      repairPriority,
      estimatedCost: this.estimateCost(dtcs),
      actionPlan,
      confidence: dtcs.every((d) => d.description !== 'Unknown DTC code') ? 0.6 : 0.4,
    };
  }

  private estimateCost(dtcs: DtcInput[]): string {
    let min = 0;
    let max = 0;

    for (const dtc of dtcs) {
      if (dtc.system === 'Ignition') { min += 50; max += 300; }
      else if (dtc.system === 'Fuel/Air') { min += 80; max += 400; }
      else if (dtc.system === 'Emissions') { min += 100; max += 600; }
      else if (dtc.system === 'Transmission') { min += 200; max += 1500; }
      else if (dtc.system === 'ABS/Brakes') { min += 150; max += 800; }
      else { min += 50; max += 300; }
    }

    return `$${min}-$${max}`;
  }
}
