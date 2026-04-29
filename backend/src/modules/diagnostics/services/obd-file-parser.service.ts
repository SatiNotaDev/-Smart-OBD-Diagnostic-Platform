import { Injectable, BadRequestException } from '@nestjs/common';

interface ParsedOBDData {
  dtcs: Array<{ code: string; description?: string; severity?: number }>;
  metrics: Array<{ name: string; value: number; unit?: string }>;
}

const DTC_REGEX = /\b([PBCU]\d{4})\b/gi;

@Injectable()
export class OBDFileParserService {
  parse(content: string, fileType: string): ParsedOBDData {
    switch (fileType) {
      case 'json':
        return this.parseJson(content);
      case 'csv':
        return this.parseCsv(content);
      case 'txt':
        return this.parseTxt(content);
      default:
        throw new BadRequestException(`Unsupported file type: ${fileType}`);
    }
  }

  private parseJson(content: string): ParsedOBDData {
    let data: any;
    try {
      data = JSON.parse(content);
    } catch {
      throw new BadRequestException('Invalid JSON file');
    }

    const dtcs: ParsedOBDData['dtcs'] = [];
    const metrics: ParsedOBDData['metrics'] = [];

    // Support common OBD scanner JSON formats
    const dtcArray = data.dtcs || data.codes || data.DTC || data.faults || data.errors || [];
    if (Array.isArray(dtcArray)) {
      for (const item of dtcArray) {
        if (typeof item === 'string') {
          const match = item.match(/^[PBCU]\d{4}/i);
          if (match) dtcs.push({ code: match[0].toUpperCase() });
        } else if (item && typeof item === 'object') {
          const code = item.code || item.dtc || item.Code || item.DTC || '';
          if (/^[PBCU]\d{4}$/i.test(code)) {
            dtcs.push({
              code: code.toUpperCase(),
              description: item.description || item.desc || item.Description || undefined,
              severity: item.severity || item.priority || undefined,
            });
          }
        }
      }
    }

    // Extract metrics/PIDs
    const metricArray = data.metrics || data.pids || data.PIDs || data.sensors || data.live_data || [];
    if (Array.isArray(metricArray)) {
      for (const item of metricArray) {
        if (item && typeof item === 'object') {
          const name = item.name || item.pid || item.parameter || item.Name || '';
          const value = parseFloat(item.value ?? item.Value ?? item.reading);
          if (name && !isNaN(value)) {
            metrics.push({
              name,
              value,
              unit: item.unit || item.Unit || item.units || undefined,
            });
          }
        }
      }
    }

    // Fallback: scan entire JSON string for DTC patterns if none found in structured fields
    if (dtcs.length === 0) {
      const matches = content.match(DTC_REGEX);
      if (matches) {
        const unique = [...new Set(matches.map((m) => m.toUpperCase()))];
        for (const code of unique) {
          dtcs.push({ code });
        }
      }
    }

    return { dtcs, metrics };
  }

  private parseCsv(content: string): ParsedOBDData {
    const lines = content.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length === 0) return { dtcs: [], metrics: [] };

    const dtcs: ParsedOBDData['dtcs'] = [];
    const metrics: ParsedOBDData['metrics'] = [];

    // Detect header row
    const header = lines[0].toLowerCase();
    const hasHeader = header.includes('code') || header.includes('dtc') || header.includes('pid') || header.includes('name');
    const dataLines = hasHeader ? lines.slice(1) : lines;

    // Try to determine columns from header
    const cols = lines[0].split(/[,;\t]/);
    const codeCol = cols.findIndex((c) => /code|dtc|fault/i.test(c));
    const descCol = cols.findIndex((c) => /desc|description|message/i.test(c));
    const sevCol = cols.findIndex((c) => /sev|severity|priority/i.test(c));
    const nameCol = cols.findIndex((c) => /name|pid|parameter|sensor/i.test(c));
    const valueCol = cols.findIndex((c) => /value|reading|data/i.test(c));
    const unitCol = cols.findIndex((c) => /unit/i.test(c));

    for (const line of dataLines) {
      const parts = line.split(/[,;\t]/).map((p) => p.trim().replace(/^["']|["']$/g, ''));

      // Try structured columns first
      if (codeCol >= 0 && parts[codeCol]) {
        const code = parts[codeCol].toUpperCase();
        if (/^[PBCU]\d{4}$/.test(code)) {
          dtcs.push({
            code,
            description: descCol >= 0 ? parts[descCol] : undefined,
            severity: sevCol >= 0 ? parseInt(parts[sevCol]) || undefined : undefined,
          });
          continue;
        }
      }

      // Try metric columns
      if (nameCol >= 0 && valueCol >= 0 && parts[nameCol] && parts[valueCol]) {
        const value = parseFloat(parts[valueCol]);
        if (!isNaN(value)) {
          metrics.push({
            name: parts[nameCol],
            value,
            unit: unitCol >= 0 ? parts[unitCol] : undefined,
          });
          continue;
        }
      }

      // Fallback: scan line for DTC codes
      for (const part of parts) {
        if (/^[PBCU]\d{4}$/i.test(part)) {
          dtcs.push({ code: part.toUpperCase() });
        }
      }
    }

    return { dtcs, metrics };
  }

  private parseTxt(content: string): ParsedOBDData {
    const dtcs: ParsedOBDData['dtcs'] = [];
    const metrics: ParsedOBDData['metrics'] = [];

    // Extract all DTC codes from plain text
    const matches = content.match(DTC_REGEX);
    if (matches) {
      const unique = [...new Set(matches.map((m) => m.toUpperCase()))];
      for (const code of unique) {
        dtcs.push({ code });
      }
    }

    // Try to extract common OBD metrics from text (e.g., "RPM: 850")
    const metricPatterns = [
      { pattern: /RPM[:\s]+(\d+)/gi, name: 'RPM', unit: 'rpm' },
      { pattern: /(?:coolant|engine)\s*temp[:\s]+(-?\d+\.?\d*)/gi, name: 'Coolant Temperature', unit: '°C' },
      { pattern: /(?:vehicle|car)\s*speed[:\s]+(\d+\.?\d*)/gi, name: 'Vehicle Speed', unit: 'km/h' },
      { pattern: /(?:fuel|fuel\s*pressure)[:\s]+(\d+\.?\d*)/gi, name: 'Fuel Pressure', unit: 'kPa' },
      { pattern: /(?:intake|MAF)[:\s]+(\d+\.?\d*)/gi, name: 'Intake Air', unit: 'g/s' },
      { pattern: /(?:throttle|TPS)[:\s]+(\d+\.?\d*)/gi, name: 'Throttle Position', unit: '%' },
      { pattern: /(?:battery|voltage)[:\s]+(\d+\.?\d*)/gi, name: 'Battery Voltage', unit: 'V' },
    ];

    for (const { pattern, name, unit } of metricPatterns) {
      const match = pattern.exec(content);
      if (match) {
        const value = parseFloat(match[1]);
        if (!isNaN(value)) metrics.push({ name, value, unit });
      }
    }

    return { dtcs, metrics };
  }
}
