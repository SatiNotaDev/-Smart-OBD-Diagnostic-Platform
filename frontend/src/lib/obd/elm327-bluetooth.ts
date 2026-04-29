/**
 * Web Bluetooth ELM327 OBD-II adapter.
 * Connects to Bluetooth Low Energy (BLE) ELM327/OBDLink adapters,
 * sends AT commands, and reads real-time PIDs.
 */

const ELM327_SERVICE_UUID = "0000fff0-0000-1000-8000-00805f9b34fb";
const ELM327_CHAR_TX_UUID = "0000fff1-0000-1000-8000-00805f9b34fb";
const ELM327_CHAR_RX_UUID = "0000fff2-0000-1000-8000-00805f9b34fb";

// Fallback UUIDs for different ELM327 clones
const FALLBACK_SERVICE_UUIDS = [
  "0000ffe0-0000-1000-8000-00805f9b34fb",
  "00001101-0000-1000-8000-00805f9b34fb",
  "0000abf0-0000-1000-8000-00805f9b34fb",
];

export type ConnectionStatus = "disconnected" | "connecting" | "initializing" | "ready" | "error";

export interface OBDMetric {
  pid: string;
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  timestamp: number;
}

export interface OBDSnapshot {
  rpm: number | null;
  speed: number | null;
  coolantTemp: number | null;
  throttle: number | null;
  engineLoad: number | null;
  fuelPressure: number | null;
  intakeTemp: number | null;
  maf: number | null;
  voltage: number | null;
  timestamp: number;
}

type StatusCallback = (status: ConnectionStatus) => void;
type DataCallback = (snapshot: OBDSnapshot) => void;
type ErrorCallback = (error: string) => void;
type RawCallback = (message: string) => void;

// OBD-II PID definitions (Mode 01)
const PIDS = {
  ENGINE_LOAD: { pid: "04", name: "Engine Load", unit: "%", min: 0, max: 100 },
  COOLANT_TEMP: { pid: "05", name: "Coolant Temperature", unit: "°C", min: -40, max: 215 },
  FUEL_PRESSURE: { pid: "0A", name: "Fuel Pressure", unit: "kPa", min: 0, max: 765 },
  RPM: { pid: "0C", name: "RPM", unit: "rpm", min: 0, max: 16383 },
  SPEED: { pid: "0D", name: "Vehicle Speed", unit: "km/h", min: 0, max: 255 },
  INTAKE_TEMP: { pid: "0F", name: "Intake Air Temperature", unit: "°C", min: -40, max: 215 },
  MAF: { pid: "10", name: "MAF Air Flow", unit: "g/s", min: 0, max: 655 },
  THROTTLE: { pid: "11", name: "Throttle Position", unit: "%", min: 0, max: 100 },
  VOLTAGE: { pid: "42", name: "Battery Voltage", unit: "V", min: 0, max: 65 },
} as const;

export class ELM327Bluetooth {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private txChar: BluetoothRemoteGATTCharacteristic | null = null;
  private rxChar: BluetoothRemoteGATTCharacteristic | null = null;
  private status: ConnectionStatus = "disconnected";
  private polling = false;
  private pollInterval: ReturnType<typeof setTimeout> | null = null;
  private responseBuffer = "";

  private onStatus: StatusCallback | null = null;
  private onData: DataCallback | null = null;
  private onError: ErrorCallback | null = null;
  private onRaw: RawCallback | null = null;

  private supportedPids: Set<string> = new Set();

  on(event: "status", cb: StatusCallback): void;
  on(event: "data", cb: DataCallback): void;
  on(event: "error", cb: ErrorCallback): void;
  on(event: "raw", cb: RawCallback): void;
  on(event: string, cb: any) {
    switch (event) {
      case "status": this.onStatus = cb; break;
      case "data": this.onData = cb; break;
      case "error": this.onError = cb; break;
      case "raw": this.onRaw = cb; break;
    }
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  getDeviceName(): string | null {
    return this.device?.name || null;
  }

  isSupported(): boolean {
    return typeof navigator !== "undefined" && "bluetooth" in navigator;
  }

  async connect(): Promise<void> {
    if (!this.isSupported()) {
      this.emitError("Web Bluetooth is not supported in this browser");
      return;
    }

    this.setStatus("connecting");

    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: "OBD" },
          { namePrefix: "ELM" },
          { namePrefix: "Vgate" },
          { namePrefix: "OBDII" },
          { namePrefix: "V-LINK" },
          { namePrefix: "IOS-Vlink" },
        ],
        optionalServices: [ELM327_SERVICE_UUID, ...FALLBACK_SERVICE_UUIDS],
      });

      this.device.addEventListener("gattserverdisconnected", () => {
        this.handleDisconnect();
      });

      this.server = await this.device.gatt!.connect();

      // Try primary service UUID, then fallbacks
      let service: BluetoothRemoteGATTService | null = null;
      for (const uuid of [ELM327_SERVICE_UUID, ...FALLBACK_SERVICE_UUIDS]) {
        try {
          service = await this.server.getPrimaryService(uuid);
          break;
        } catch {
          continue;
        }
      }

      if (!service) {
        throw new Error("No compatible OBD service found on device");
      }

      const chars = await service.getCharacteristics();

      // Find TX (write) and RX (notify) characteristics
      for (const char of chars) {
        if (char.properties.write || char.properties.writeWithoutResponse) {
          this.txChar = char;
        }
        if (char.properties.notify) {
          this.rxChar = char;
        }
      }

      if (!this.txChar || !this.rxChar) {
        throw new Error("Could not find TX/RX characteristics");
      }

      await this.rxChar.startNotifications();
      this.rxChar.addEventListener("characteristicvaluechanged", this.handleNotification.bind(this));

      await this.initialize();
    } catch (err: any) {
      if (err.name === "NotFoundError") {
        this.setStatus("disconnected");
        return;
      }
      this.emitError(err.message || "Connection failed");
      this.setStatus("error");
    }
  }

  async disconnect(): Promise<void> {
    this.stopPolling();
    if (this.server?.connected) {
      this.server.disconnect();
    }
    this.handleDisconnect();
  }

  startPolling(intervalMs = 300): void {
    if (this.status !== "ready") return;
    this.polling = true;
    this.poll(intervalMs);
  }

  stopPolling(): void {
    this.polling = false;
    if (this.pollInterval) {
      clearTimeout(this.pollInterval);
      this.pollInterval = null;
    }
  }

  async readDTCs(): Promise<string[]> {
    const response = await this.sendCommand("03");
    return this.parseDTCResponse(response);
  }

  async clearDTCs(): Promise<boolean> {
    const response = await this.sendCommand("04");
    return response.includes("44");
  }

  // ─── Private ──────────────────────────────────────────────────────

  private async initialize(): Promise<void> {
    this.setStatus("initializing");

    // Reset and configure ELM327
    const initCommands = [
      "ATZ",       // Reset
      "ATE0",      // Echo off
      "ATL0",      // Linefeeds off
      "ATS0",      // Spaces off
      "ATH0",      // Headers off
      "ATSP0",     // Auto protocol
      "ATAT1",     // Adaptive timing
    ];

    for (const cmd of initCommands) {
      await this.sendCommand(cmd);
      await this.delay(100);
    }

    // Query supported PIDs
    const pidResponse = await this.sendCommand("0100");
    this.parseSupportedPids(pidResponse);

    this.setStatus("ready");
  }

  private async poll(intervalMs: number): Promise<void> {
    if (!this.polling || this.status !== "ready") return;

    const snapshot: OBDSnapshot = {
      rpm: null,
      speed: null,
      coolantTemp: null,
      throttle: null,
      engineLoad: null,
      fuelPressure: null,
      intakeTemp: null,
      maf: null,
      voltage: null,
      timestamp: Date.now(),
    };

    // Read essential PIDs
    if (this.isPidSupported(PIDS.RPM.pid)) {
      snapshot.rpm = await this.readPid(PIDS.RPM.pid, this.decodeRpm);
    }
    if (this.isPidSupported(PIDS.SPEED.pid)) {
      snapshot.speed = await this.readPid(PIDS.SPEED.pid, this.decodeSpeed);
    }
    if (this.isPidSupported(PIDS.COOLANT_TEMP.pid)) {
      snapshot.coolantTemp = await this.readPid(PIDS.COOLANT_TEMP.pid, this.decodeTemp);
    }
    if (this.isPidSupported(PIDS.THROTTLE.pid)) {
      snapshot.throttle = await this.readPid(PIDS.THROTTLE.pid, this.decodePercent);
    }
    if (this.isPidSupported(PIDS.ENGINE_LOAD.pid)) {
      snapshot.engineLoad = await this.readPid(PIDS.ENGINE_LOAD.pid, this.decodePercent);
    }
    if (this.isPidSupported(PIDS.MAF.pid)) {
      snapshot.maf = await this.readPid(PIDS.MAF.pid, this.decodeMaf);
    }
    if (this.isPidSupported(PIDS.INTAKE_TEMP.pid)) {
      snapshot.intakeTemp = await this.readPid(PIDS.INTAKE_TEMP.pid, this.decodeTemp);
    }
    if (this.isPidSupported(PIDS.VOLTAGE.pid)) {
      snapshot.voltage = await this.readPid(PIDS.VOLTAGE.pid, this.decodeVoltage);
    }

    this.onData?.(snapshot);

    this.pollInterval = setTimeout(() => this.poll(intervalMs), intervalMs);
  }

  private async readPid(pid: string, decoder: (bytes: number[]) => number): Promise<number | null> {
    try {
      const response = await this.sendCommand(`01${pid}`);
      const bytes = this.parseHexResponse(response, pid);
      if (bytes.length === 0) return null;
      return decoder(bytes);
    } catch {
      return null;
    }
  }

  private async sendCommand(cmd: string): Promise<string> {
    if (!this.txChar) throw new Error("Not connected");

    this.responseBuffer = "";
    const data = new TextEncoder().encode(cmd + "\r");

    if (this.txChar.properties.writeWithoutResponse) {
      await this.txChar.writeValueWithoutResponse(data);
    } else {
      await this.txChar.writeValue(data);
    }

    // Wait for complete response (terminated by ">")
    return this.waitForResponse(2000);
  }

  private waitForResponse(timeoutMs: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        if (this.responseBuffer.includes(">")) {
          const response = this.responseBuffer.replace(/>/g, "").trim();
          this.onRaw?.(response);
          resolve(response);
          return;
        }
        if (Date.now() - start > timeoutMs) {
          resolve(this.responseBuffer.trim());
          return;
        }
        setTimeout(check, 20);
      };
      check();
    });
  }

  private handleNotification(event: Event): void {
    const value = (event.target as unknown as BluetoothRemoteGATTCharacteristic).value;
    if (!value) return;
    const text = new TextDecoder().decode(value);
    this.responseBuffer += text;
  }

  private handleDisconnect(): void {
    this.stopPolling();
    this.device = null;
    this.server = null;
    this.txChar = null;
    this.rxChar = null;
    this.setStatus("disconnected");
  }

  private setStatus(status: ConnectionStatus) {
    this.status = status;
    this.onStatus?.(status);
  }

  private emitError(msg: string) {
    this.onError?.(msg);
  }

  // ─── PID Decoders ──────────────────────────────────────────────────

  private decodeRpm(bytes: number[]): number {
    return bytes.length >= 2 ? ((bytes[0] * 256) + bytes[1]) / 4 : 0;
  }

  private decodeSpeed(bytes: number[]): number {
    return bytes.length >= 1 ? bytes[0] : 0;
  }

  private decodeTemp(bytes: number[]): number {
    return bytes.length >= 1 ? bytes[0] - 40 : 0;
  }

  private decodePercent(bytes: number[]): number {
    return bytes.length >= 1 ? Math.round((bytes[0] / 255) * 100) : 0;
  }

  private decodeMaf(bytes: number[]): number {
    return bytes.length >= 2 ? ((bytes[0] * 256) + bytes[1]) / 100 : 0;
  }

  private decodeVoltage(bytes: number[]): number {
    return bytes.length >= 2 ? ((bytes[0] * 256) + bytes[1]) / 1000 : 0;
  }

  // ─── Response Parsers ─────────────────────────────────────────────

  private parseHexResponse(response: string, expectedPid: string): number[] {
    const clean = response.replace(/[\s\r\n]/g, "").toUpperCase();
    // Expected format: 4105XX or 410CXXYY (41 = response to mode 01)
    const prefix = `41${expectedPid.toUpperCase()}`;
    const idx = clean.indexOf(prefix);
    if (idx === -1) return [];

    const dataStr = clean.slice(idx + prefix.length);
    const bytes: number[] = [];
    for (let i = 0; i < dataStr.length; i += 2) {
      const byte = parseInt(dataStr.slice(i, i + 2), 16);
      if (isNaN(byte)) break;
      bytes.push(byte);
    }
    return bytes;
  }

  private parseSupportedPids(response: string): void {
    const bytes = this.parseHexResponse(response, "00");
    if (bytes.length < 4) {
      // Assume all common PIDs supported if query fails
      Object.values(PIDS).forEach((p) => this.supportedPids.add(p.pid));
      return;
    }

    // Each bit represents support for PIDs 01-20
    for (let i = 0; i < 4; i++) {
      for (let bit = 7; bit >= 0; bit--) {
        const pidNum = i * 8 + (7 - bit) + 1;
        if (bytes[i] & (1 << bit)) {
          this.supportedPids.add(pidNum.toString(16).padStart(2, "0").toUpperCase());
        }
      }
    }
  }

  private isPidSupported(pid: string): boolean {
    return this.supportedPids.has(pid.toUpperCase()) || this.supportedPids.size === 0;
  }

  private parseDTCResponse(response: string): string[] {
    const clean = response.replace(/[\s\r\n]/g, "").toUpperCase();
    if (clean.includes("NODATA") || !clean.startsWith("43")) return [];

    const dtcData = clean.slice(2);
    const codes: string[] = [];
    const prefixes: Record<string, string> = { "0": "P0", "1": "P1", "2": "P2", "3": "P3", "4": "C0", "5": "C1", "6": "C2", "7": "C3", "8": "B0", "9": "B1", "A": "B2", "B": "B3", "C": "U0", "D": "U1", "E": "U2", "F": "U3" };

    for (let i = 0; i < dtcData.length; i += 4) {
      const chunk = dtcData.slice(i, i + 4);
      if (chunk.length < 4 || chunk === "0000") continue;
      const prefix = prefixes[chunk[0]] || "P0";
      codes.push(`${prefix}${chunk.slice(1)}`);
    }

    return codes;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }
}

export const obdAdapter = new ELM327Bluetooth();
export { PIDS };
