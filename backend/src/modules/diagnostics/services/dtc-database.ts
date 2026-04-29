/**
 * Static DTC code database with descriptions and severity.
 * Covers common OBD-II codes (P0xxx, P2xxx, B, C, U).
 */

interface DtcInfo {
  description: string;
  severity: number; // 1=info, 2=low, 3=medium, 4=high, 5=critical
  system: string;
}

const DTC_DATABASE: Record<string, DtcInfo> = {
  // Fuel and Air Metering
  P0100: { description: 'Mass Air Flow (MAF) Circuit Malfunction', severity: 3, system: 'Fuel/Air' },
  P0101: { description: 'Mass Air Flow (MAF) Circuit Range/Performance', severity: 3, system: 'Fuel/Air' },
  P0102: { description: 'Mass Air Flow (MAF) Circuit Low Input', severity: 3, system: 'Fuel/Air' },
  P0103: { description: 'Mass Air Flow (MAF) Circuit High Input', severity: 3, system: 'Fuel/Air' },
  P0110: { description: 'Intake Air Temperature (IAT) Circuit Malfunction', severity: 2, system: 'Fuel/Air' },
  P0115: { description: 'Engine Coolant Temperature (ECT) Circuit Malfunction', severity: 3, system: 'Cooling' },
  P0120: { description: 'Throttle Position Sensor (TPS) Circuit Malfunction', severity: 4, system: 'Fuel/Air' },
  P0121: { description: 'Throttle Position Sensor Range/Performance', severity: 3, system: 'Fuel/Air' },
  P0130: { description: 'O2 Sensor Circuit Malfunction (Bank 1 Sensor 1)', severity: 3, system: 'Emissions' },
  P0131: { description: 'O2 Sensor Circuit Low Voltage (Bank 1 Sensor 1)', severity: 3, system: 'Emissions' },
  P0133: { description: 'O2 Sensor Slow Response (Bank 1 Sensor 1)', severity: 2, system: 'Emissions' },
  P0171: { description: 'System Too Lean (Bank 1)', severity: 3, system: 'Fuel/Air' },
  P0172: { description: 'System Too Rich (Bank 1)', severity: 3, system: 'Fuel/Air' },
  P0174: { description: 'System Too Lean (Bank 2)', severity: 3, system: 'Fuel/Air' },
  P0175: { description: 'System Too Rich (Bank 2)', severity: 3, system: 'Fuel/Air' },

  // Ignition System
  P0300: { description: 'Random/Multiple Cylinder Misfire Detected', severity: 4, system: 'Ignition' },
  P0301: { description: 'Cylinder 1 Misfire Detected', severity: 4, system: 'Ignition' },
  P0302: { description: 'Cylinder 2 Misfire Detected', severity: 4, system: 'Ignition' },
  P0303: { description: 'Cylinder 3 Misfire Detected', severity: 4, system: 'Ignition' },
  P0304: { description: 'Cylinder 4 Misfire Detected', severity: 4, system: 'Ignition' },
  P0305: { description: 'Cylinder 5 Misfire Detected', severity: 4, system: 'Ignition' },
  P0306: { description: 'Cylinder 6 Misfire Detected', severity: 4, system: 'Ignition' },
  P0335: { description: 'Crankshaft Position Sensor A Circuit Malfunction', severity: 5, system: 'Ignition' },
  P0340: { description: 'Camshaft Position Sensor Circuit Malfunction', severity: 4, system: 'Ignition' },

  // Emissions
  P0400: { description: 'Exhaust Gas Recirculation (EGR) Flow Malfunction', severity: 3, system: 'Emissions' },
  P0401: { description: 'EGR Insufficient Flow Detected', severity: 3, system: 'Emissions' },
  P0420: { description: 'Catalyst System Efficiency Below Threshold (Bank 1)', severity: 3, system: 'Emissions' },
  P0430: { description: 'Catalyst System Efficiency Below Threshold (Bank 2)', severity: 3, system: 'Emissions' },
  P0440: { description: 'Evaporative Emission Control System Malfunction', severity: 2, system: 'Emissions' },
  P0442: { description: 'EVAP System Leak Detected (Small Leak)', severity: 2, system: 'Emissions' },
  P0446: { description: 'EVAP System Vent Control Circuit Malfunction', severity: 2, system: 'Emissions' },
  P0455: { description: 'EVAP System Leak Detected (Large Leak)', severity: 3, system: 'Emissions' },

  // Speed/Idle Control
  P0500: { description: 'Vehicle Speed Sensor Malfunction', severity: 4, system: 'Drivetrain' },
  P0505: { description: 'Idle Control System Malfunction', severity: 3, system: 'Fuel/Air' },
  P0507: { description: 'Idle Control System RPM Higher Than Expected', severity: 2, system: 'Fuel/Air' },

  // Transmission
  P0700: { description: 'Transmission Control System Malfunction', severity: 4, system: 'Transmission' },
  P0715: { description: 'Input/Turbine Speed Sensor Circuit Malfunction', severity: 4, system: 'Transmission' },
  P0720: { description: 'Output Speed Sensor Circuit Malfunction', severity: 4, system: 'Transmission' },
  P0730: { description: 'Incorrect Gear Ratio', severity: 4, system: 'Transmission' },
  P0741: { description: 'Torque Converter Clutch Stuck Off', severity: 3, system: 'Transmission' },
  P0750: { description: 'Shift Solenoid A Malfunction', severity: 4, system: 'Transmission' },

  // Powertrain
  P2096: { description: 'Post Catalyst Fuel Trim System Too Lean (Bank 1)', severity: 3, system: 'Emissions' },
  P2097: { description: 'Post Catalyst Fuel Trim System Too Rich (Bank 1)', severity: 3, system: 'Emissions' },
  P2101: { description: 'Throttle Actuator Control Motor Circuit Range/Performance', severity: 4, system: 'Fuel/Air' },
  P2135: { description: 'Throttle Position Sensor Voltage Correlation', severity: 5, system: 'Fuel/Air' },
  P2187: { description: 'System Too Lean at Idle (Bank 1)', severity: 3, system: 'Fuel/Air' },
  P2188: { description: 'System Too Rich at Idle (Bank 1)', severity: 3, system: 'Fuel/Air' },

  // Body
  B0001: { description: 'Driver Frontal Stage 1 Deployment Control', severity: 5, system: 'Body/Safety' },
  B1000: { description: 'ECU Malfunction (Body)', severity: 3, system: 'Body' },

  // Chassis
  C0035: { description: 'Left Front Wheel Speed Sensor Circuit', severity: 4, system: 'ABS/Brakes' },
  C0040: { description: 'Right Front Wheel Speed Sensor Circuit', severity: 4, system: 'ABS/Brakes' },
  C0045: { description: 'Left Rear Wheel Speed Sensor Circuit', severity: 4, system: 'ABS/Brakes' },
  C0050: { description: 'Right Rear Wheel Speed Sensor Circuit', severity: 4, system: 'ABS/Brakes' },

  // Network/Communication
  U0100: { description: 'Lost Communication with ECM/PCM A', severity: 5, system: 'Network' },
  U0101: { description: 'Lost Communication with TCM', severity: 4, system: 'Network' },
  U0121: { description: 'Lost Communication with ABS Control Module', severity: 4, system: 'Network' },
  U0140: { description: 'Lost Communication with Body Control Module', severity: 3, system: 'Network' },
};

export function lookupDtc(code: string): DtcInfo | null {
  const upper = code.toUpperCase().trim();
  return DTC_DATABASE[upper] || null;
}

export function enrichDtcCode(code: string, userDescription?: string, userSeverity?: number) {
  const info = lookupDtc(code);
  return {
    code: code.toUpperCase().trim(),
    description: userDescription || info?.description || 'Unknown DTC code',
    severity: userSeverity || info?.severity || 2,
    system: info?.system || 'Unknown',
  };
}
