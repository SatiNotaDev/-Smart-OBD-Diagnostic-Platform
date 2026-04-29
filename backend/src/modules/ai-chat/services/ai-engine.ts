/**
 * Rule-based AI engine for diagnostic interpretation.
 * Generates contextual responses based on vehicle data and DTC codes.
 *
 * NOTE: This is a local rule-based system — no external API calls.
 * Can be replaced with actual LLM integration (Claude API) later.
 */

interface VehicleContext {
  brand: string;
  model: string;
  year: number;
  engineType: string;
  mileage: number | null;
}

interface ChatContext {
  vehicle: VehicleContext;
  recentDtcs: Array<{ code: string; description: string; severity: number }>;
  messageHistory: Array<{ role: string; content: string }>;
}

export function generateAiResponse(userMessage: string, context: ChatContext): string {
  const msg = userMessage.toLowerCase();

  // DTC-related questions
  if (msg.includes('p0') || msg.includes('b0') || msg.includes('c0') || msg.includes('u0') || msg.includes('код') || msg.includes('code') || msg.includes('dtc')) {
    return handleDtcQuestion(msg, context);
  }

  // Diagnostic summary
  if (msg.includes('diagnos') || msg.includes('диагност') || msg.includes('scan') || msg.includes('скан') || msg.includes('problem') || msg.includes('проблем')) {
    return handleDiagnosticQuestion(context);
  }

  // Maintenance questions
  if (msg.includes('maintenance') || msg.includes('то ') || msg.includes('обслуж') || msg.includes('service') || msg.includes('сервис') || msg.includes('замен')) {
    return handleMaintenanceQuestion(msg, context);
  }

  // Cost/repair questions
  if (msg.includes('cost') || msg.includes('price') || msg.includes('стоим') || msg.includes('цена') || msg.includes('ремонт') || msg.includes('repair') || msg.includes('fix')) {
    return handleRepairQuestion(msg, context);
  }

  // Mileage-based recommendations
  if (msg.includes('mileage') || msg.includes('пробег') || msg.includes('km') || msg.includes('километр')) {
    return handleMileageQuestion(context);
  }

  // General greeting or unclear
  return handleGeneralQuestion(context);
}

function handleDtcQuestion(msg: string, context: ChatContext): string {
  if (context.recentDtcs.length === 0) {
    return `I don't see any DTC codes recorded for your ${context.vehicle.brand} ${context.vehicle.model}. If you have codes from an OBD-II scanner, you can add them in the Diagnostics section and I'll help interpret them.`;
  }

  const critical = context.recentDtcs.filter((d) => d.severity >= 4);
  const moderate = context.recentDtcs.filter((d) => d.severity === 3);

  let response = `Based on your ${context.vehicle.brand} ${context.vehicle.model} (${context.vehicle.year}):\n\n`;

  if (critical.length > 0) {
    response += `⚠️ **Critical issues (${critical.length}):**\n`;
    critical.forEach((d) => {
      response += `- **${d.code}**: ${d.description}\n`;
    });
    response += '\nThese require immediate attention. Driving with these issues may cause further damage.\n\n';
  }

  if (moderate.length > 0) {
    response += `**Moderate issues (${moderate.length}):**\n`;
    moderate.forEach((d) => {
      response += `- **${d.code}**: ${d.description}\n`;
    });
    response += '\nThese should be addressed soon but are not immediately dangerous.\n';
  }

  return response;
}

function handleDiagnosticQuestion(context: ChatContext): string {
  if (context.recentDtcs.length === 0) {
    return `Your ${context.vehicle.brand} ${context.vehicle.model} (${context.vehicle.year}) has no recorded diagnostic codes. This is a good sign! If your check engine light is on, run a scan with an OBD-II reader and add the codes here for analysis.`;
  }

  const systems = [...new Set(context.recentDtcs.map((d) => {
    if (d.code.startsWith('P0') || d.code.startsWith('P2')) return 'Engine/Powertrain';
    if (d.code.startsWith('B')) return 'Body';
    if (d.code.startsWith('C')) return 'Chassis/ABS';
    if (d.code.startsWith('U')) return 'Network/Communication';
    return 'Unknown';
  }))];

  let response = `**Diagnostic Summary for ${context.vehicle.brand} ${context.vehicle.model}:**\n\n`;
  response += `- ${context.recentDtcs.length} active code(s)\n`;
  response += `- Affected systems: ${systems.join(', ')}\n\n`;

  const maxSev = Math.max(...context.recentDtcs.map((d) => d.severity));
  if (maxSev >= 5) {
    response += '🔴 **Urgency: CRITICAL** — Do not drive. Tow to a mechanic immediately.\n';
  } else if (maxSev >= 4) {
    response += '🟠 **Urgency: HIGH** — Schedule a repair within a few days.\n';
  } else if (maxSev >= 3) {
    response += '🟡 **Urgency: MODERATE** — Safe to drive short distances, but repair soon.\n';
  } else {
    response += '🟢 **Urgency: LOW** — Monitor the situation. Not immediately dangerous.\n';
  }

  response += '\nWould you like me to explain any specific code in more detail?';
  return response;
}

function handleMaintenanceQuestion(msg: string, context: ChatContext): string {
  const { year, mileage, engineType } = context.vehicle;
  const age = new Date().getFullYear() - year;

  let response = `**Maintenance recommendations for your ${context.vehicle.brand} ${context.vehicle.model}:**\n\n`;

  const items: string[] = [];

  if (mileage) {
    if (mileage > 10000) items.push('Oil change (every 10,000-15,000 km)');
    if (mileage > 30000) items.push('Air filter replacement');
    if (mileage > 40000) items.push('Brake pad inspection');
    if (mileage > 60000) items.push('Transmission fluid change');
    if (mileage > 80000) items.push('Timing belt inspection');
    if (mileage > 100000) items.push('Spark plugs replacement');
  }

  if (age > 3) items.push('Battery check (3+ years old)');
  if (age > 5) items.push('Coolant flush');

  if (engineType === 'diesel') {
    items.push('DPF regeneration check');
    items.push('Fuel filter replacement');
  }

  if (items.length > 0) {
    response += 'Based on your vehicle\'s age and mileage, consider:\n';
    items.forEach((item) => { response += `- ${item}\n`; });
  } else {
    response += 'Your vehicle appears relatively new. Follow the manufacturer\'s maintenance schedule.\n';
  }

  return response;
}

function handleRepairQuestion(msg: string, context: ChatContext): string {
  if (context.recentDtcs.length === 0) {
    return `Without specific diagnostic codes, I can't estimate repair costs. Run a diagnostic scan to identify the exact issues with your ${context.vehicle.brand} ${context.vehicle.model}.`;
  }

  let response = `**Repair guidance for your ${context.vehicle.brand} ${context.vehicle.model}:**\n\n`;
  response += 'Note: Costs vary significantly by region and shop. These are rough estimates:\n\n';

  for (const dtc of context.recentDtcs.slice(0, 5)) {
    response += `**${dtc.code}** — ${dtc.description}\n`;
    response += `  Typical fix: ${getTypicalFix(dtc.code)}\n\n`;
  }

  response += '💡 I recommend getting 2-3 quotes from local mechanics. An independent shop is usually 30-50% cheaper than a dealership for these repairs.';
  return response;
}

function handleMileageQuestion(context: ChatContext): string {
  const { mileage } = context.vehicle;
  if (!mileage) {
    return 'Your mileage isn\'t recorded. Update it in the vehicle settings, and I can give mileage-based recommendations.';
  }

  let response = `Your ${context.vehicle.brand} ${context.vehicle.model} has ${mileage.toLocaleString()} km.\n\n`;

  if (mileage < 30000) response += 'Still in early life — focus on regular oil changes and tire rotations.';
  else if (mileage < 60000) response += 'Moderate mileage — time to check brakes, filters, and fluid levels.';
  else if (mileage < 100000) response += 'Medium-high mileage — consider timing belt, suspension, and transmission service.';
  else if (mileage < 200000) response += 'High mileage — keep up with maintenance and budget for bigger repairs (water pump, alternator, etc).';
  else response += 'Very high mileage — impressive! Watch for oil consumption, engine mounts, and exhaust components.';

  return response;
}

function handleGeneralQuestion(context: ChatContext): string {
  return `I'm your diagnostic assistant for the ${context.vehicle.brand} ${context.vehicle.model} (${context.vehicle.year}). I can help with:\n\n- **DTC code interpretation** — explain what error codes mean\n- **Diagnostic summary** — overall vehicle health\n- **Maintenance advice** — what's due based on mileage and age\n- **Repair guidance** — typical fixes and what to expect\n\nHow can I help?`;
}

function getTypicalFix(code: string): string {
  const fixes: Record<string, string> = {
    P0300: 'Check spark plugs, ignition coils, fuel injectors',
    P0301: 'Replace spark plug or ignition coil for cylinder 1',
    P0420: 'Catalytic converter replacement or O2 sensor',
    P0171: 'Check for vacuum leaks, clean MAF sensor, check fuel pressure',
    P0172: 'Check fuel injectors, clean MAF sensor, check fuel pressure regulator',
    P0440: 'Check gas cap seal, EVAP system hoses',
    P0455: 'Replace gas cap or check EVAP canister',
    P0500: 'Replace vehicle speed sensor',
    P0700: 'Transmission diagnostic required — check fluid level first',
    P0335: 'Replace crankshaft position sensor',
  };

  return fixes[code.toUpperCase()] || 'Consult a mechanic for specific repair steps';
}
