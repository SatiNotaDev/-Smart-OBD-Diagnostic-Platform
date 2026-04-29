import Anthropic from '@anthropic-ai/sdk';

export interface VehicleContext {
  brand: string;
  model: string;
  year: number;
  engineType: string;
  mileage: number | null;
}

export interface ChatContext {
  vehicle: VehicleContext;
  recentDtcs: Array<{ code: string; description: string; severity: number }>;
  messageHistory: Array<{ role: string; content: string }>;
}

let anthropicClient: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

function buildSystemPrompt(context: ChatContext): string {
  const { vehicle, recentDtcs } = context;

  let systemPrompt = `You are an expert automotive diagnostic assistant for a ${vehicle.brand} ${vehicle.model} (${vehicle.year}, ${vehicle.engineType} engine${vehicle.mileage ? `, ${vehicle.mileage.toLocaleString()} km` : ''}).

Your role:
- Interpret OBD-II DTC codes and explain what they mean in plain language
- Assess severity and urgency of issues
- Provide maintenance recommendations based on vehicle age and mileage
- Suggest likely causes and typical repair steps
- Give rough cost estimates when asked
- Prioritize safety — always recommend professional inspection for critical issues

Rules:
- Be concise but informative (2-4 paragraphs max)
- Use markdown formatting for readability
- If you don't know something specific to this exact model, say so
- Never guarantee a diagnosis — you provide decision support, not certified diagnostics
- Respond in the same language the user writes in`;

  if (recentDtcs.length > 0) {
    systemPrompt += '\n\nCurrent active DTC codes for this vehicle:\n';
    recentDtcs.forEach((dtc) => {
      systemPrompt += `- ${dtc.code}: ${dtc.description} (severity: ${dtc.severity}/5)\n`;
    });
  }

  return systemPrompt;
}

export async function generateAiResponse(
  userMessage: string,
  context: ChatContext,
): Promise<string> {
  const client = getClient();

  if (!client) {
    return generateFallbackResponse(userMessage, context);
  }

  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  for (const msg of context.messageHistory) {
    messages.push({
      role: msg.role === 'USER' ? 'user' : 'assistant',
      content: msg.content,
    });
  }

  messages.push({ role: 'user', content: userMessage });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6-20250514',
    max_tokens: 1024,
    system: buildSystemPrompt(context),
    messages,
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock?.text || 'Sorry, I could not generate a response.';
}

function generateFallbackResponse(userMessage: string, context: ChatContext): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes('p0') || msg.includes('b0') || msg.includes('c0') || msg.includes('u0') || msg.includes('код') || msg.includes('code') || msg.includes('dtc')) {
    return handleDtcQuestion(context);
  }

  if (msg.includes('diagnos') || msg.includes('диагност') || msg.includes('scan') || msg.includes('скан') || msg.includes('problem') || msg.includes('проблем')) {
    return handleDiagnosticQuestion(context);
  }

  if (msg.includes('maintenance') || msg.includes('то ') || msg.includes('обслуж') || msg.includes('service') || msg.includes('сервис')) {
    return handleMaintenanceQuestion(context);
  }

  return `I'm your diagnostic assistant for the ${context.vehicle.brand} ${context.vehicle.model} (${context.vehicle.year}). I can help with:\n\n- **DTC code interpretation**\n- **Diagnostic summary**\n- **Maintenance advice**\n- **Repair guidance**\n\n⚠️ AI service is not configured. Set ANTHROPIC_API_KEY for full AI responses.\n\nHow can I help?`;
}

function handleDtcQuestion(context: ChatContext): string {
  if (context.recentDtcs.length === 0) {
    return `No DTC codes recorded for your ${context.vehicle.brand} ${context.vehicle.model}. Add codes in the Diagnostics section for analysis.`;
  }

  let response = `**DTC codes for ${context.vehicle.brand} ${context.vehicle.model}:**\n\n`;
  const critical = context.recentDtcs.filter((d) => d.severity >= 4);
  const moderate = context.recentDtcs.filter((d) => d.severity >= 2 && d.severity < 4);

  if (critical.length > 0) {
    response += '⚠️ **Critical:**\n';
    critical.forEach((d) => { response += `- **${d.code}**: ${d.description}\n`; });
    response += '\n';
  }
  if (moderate.length > 0) {
    response += '**Moderate:**\n';
    moderate.forEach((d) => { response += `- **${d.code}**: ${d.description}\n`; });
  }

  return response;
}

function handleDiagnosticQuestion(context: ChatContext): string {
  if (context.recentDtcs.length === 0) {
    return `No diagnostic codes for your ${context.vehicle.brand} ${context.vehicle.model}. Run a scan with an OBD-II reader.`;
  }

  const maxSev = Math.max(...context.recentDtcs.map((d) => d.severity));
  let urgency = '🟢 LOW';
  if (maxSev >= 5) urgency = '🔴 CRITICAL';
  else if (maxSev >= 4) urgency = '🟠 HIGH';
  else if (maxSev >= 3) urgency = '🟡 MODERATE';

  return `**Diagnostic Summary:** ${context.recentDtcs.length} active code(s), urgency: ${urgency}\n\n` +
    context.recentDtcs.map((d) => `- **${d.code}**: ${d.description} (severity ${d.severity}/5)`).join('\n');
}

function handleMaintenanceQuestion(context: ChatContext): string {
  const { year, mileage, engineType } = context.vehicle;
  const age = new Date().getFullYear() - year;
  const items: string[] = [];

  if (mileage) {
    if (mileage > 10000) items.push('Oil change');
    if (mileage > 30000) items.push('Air filter');
    if (mileage > 40000) items.push('Brake inspection');
    if (mileage > 60000) items.push('Transmission fluid');
    if (mileage > 80000) items.push('Timing belt');
  }
  if (age > 3) items.push('Battery check');
  if (engineType === 'diesel') items.push('DPF check', 'Fuel filter');

  if (items.length === 0) return 'Your vehicle is relatively new. Follow the manufacturer schedule.';

  return `**Maintenance for ${context.vehicle.brand} ${context.vehicle.model}:**\n\n` +
    items.map((i) => `- ${i}`).join('\n');
}
