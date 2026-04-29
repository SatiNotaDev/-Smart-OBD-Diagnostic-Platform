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

// --- DTC Response Cache ---
const dtcCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(message: string, vehicleSig: string): string | null {
  const normalized = message.trim().toLowerCase();
  const dtcMatch = normalized.match(/^(?:what is|что такое|explain|объясни|код)\s*([pbcu]\d{4})[\s?!.]*$/i);
  if (dtcMatch) {
    return `dtc:${dtcMatch[1].toUpperCase()}:${vehicleSig}`;
  }
  return null;
}

function getFromCache(key: string): string | null {
  const entry = dtcCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    dtcCache.delete(key);
    return null;
  }
  return entry.response;
}

function setCache(key: string, response: string): void {
  if (dtcCache.size > 500) {
    const oldest = [...dtcCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
    if (oldest) dtcCache.delete(oldest[0]);
  }
  dtcCache.set(key, { response, timestamp: Date.now() });
}

// --- Model Routing ---
type ModelId = 'claude-haiku-4-5-20251001' | 'claude-sonnet-4-6-20250514';

function selectModel(userMessage: string, context: ChatContext): ModelId {
  const msg = userMessage.toLowerCase();

  const isSimple =
    /^(?:what is|что такое|explain|объясни|расскажи про|what does|как расшифровать)\s+[pbcu]\d{4}/i.test(msg) ||
    /^(?:how much|сколько стоит|cost|price|цена)/i.test(msg) ||
    msg.length < 60;

  const isComplex =
    context.recentDtcs.length > 3 ||
    /(?:correlat|связ|причин|root cause|взаимосвяз|together|вместе|analyze|анализ)/i.test(msg) ||
    context.messageHistory.length > 6;

  if (isComplex) return 'claude-sonnet-4-6-20250514';
  if (isSimple) return 'claude-haiku-4-5-20251001';
  return 'claude-haiku-4-5-20251001';
}

// --- History Truncation ---
const MAX_HISTORY_MESSAGES = 10;

function truncateHistory(
  history: Array<{ role: string; content: string }>,
): Array<{ role: 'user' | 'assistant'; content: string }> {
  const recent = history.slice(-MAX_HISTORY_MESSAGES);

  // Ensure first message is from user (API requirement)
  const startIdx = recent.findIndex((m) => m.role === 'USER');
  const trimmed = startIdx > 0 ? recent.slice(startIdx) : recent;

  return trimmed.map((m) => ({
    role: m.role === 'USER' ? 'user' as const : 'assistant' as const,
    content: m.content,
  }));
}

// --- System Prompt ---
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

// --- Main Entry Point ---
export async function generateAiResponse(
  userMessage: string,
  context: ChatContext,
): Promise<string> {
  const client = getClient();

  if (!client) {
    return generateFallbackResponse(userMessage, context);
  }

  // Check cache for simple DTC lookups
  const vehicleSig = `${context.vehicle.brand}-${context.vehicle.model}-${context.vehicle.year}`;
  const cacheKey = getCacheKey(userMessage, vehicleSig);
  if (cacheKey) {
    const cached = getFromCache(cacheKey);
    if (cached) return cached;
  }

  // Truncate history to last N messages
  const messages = truncateHistory(context.messageHistory);
  messages.push({ role: 'user', content: userMessage });

  // Route to appropriate model
  const model = selectModel(userMessage, context);

  const response = await client.messages.create({
    model,
    max_tokens: model.includes('haiku') ? 512 : 1024,
    system: buildSystemPrompt(context),
    messages,
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  const result = textBlock?.text || 'Sorry, I could not generate a response.';

  // Cache if it was a simple DTC question
  if (cacheKey) {
    setCache(cacheKey, result);
  }

  return result;
}

// --- Fallback (no API key) ---
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
