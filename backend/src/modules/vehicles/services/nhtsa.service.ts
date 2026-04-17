import { Injectable, Logger, BadRequestException } from '@nestjs/common';

const NHTSA_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';

/** TTL for the in-memory makes cache (1 hour). */
const MAKES_CACHE_TTL_MS = 60 * 60 * 1000;

interface NhtsaResult {
  Variable: string;
  Value: string | null;
}

interface NhtsaMakeResult {
  Make_ID: number;
  Make_Name: string;
}

interface NhtsaModelResult {
  Model_ID: number;
  Model_Name: string;
}

export interface DecodedVin {
  make: string | null;
  model: string | null;
  year: number | null;
  engineType: string | null;
  engineSize: string | null;
  fuelType: string | null;
  bodyType: string | null;
  driveType: string | null;
  transmission: string | null;
}

export interface VehicleMake {
  id: number;
  name: string;
}

export interface VehicleModel {
  id: number;
  name: string;
}

@Injectable()
export class NhtsaService {
  private readonly logger = new Logger(NhtsaService.name);

  /** In-memory cache for all makes. */
  private makesCache: VehicleMake[] | null = null;
  private makesCacheTimestamp = 0;

  /**
   * Decode a VIN using the NHTSA vPIC API.
   */
  async decodeVin(vin: string): Promise<DecodedVin> {
    const cleaned = vin.trim().toUpperCase();

    if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(cleaned)) {
      throw new BadRequestException(
        'Invalid VIN format. A VIN must be exactly 17 alphanumeric characters (excluding I, O, Q).',
      );
    }

    const url = `${NHTSA_BASE_URL}/decodevin/${cleaned}?format=json`;
    this.logger.log(`Decoding VIN: ${cleaned}`);

    const data = await this.fetchJson<{ Results: NhtsaResult[] }>(url);
    const results = data.Results ?? [];

    const getValue = (variable: string): string | null => {
      const entry = results.find((r) => r.Variable === variable);
      return entry?.Value?.trim() || null;
    };

    const yearStr = getValue('Model Year');
    const fuelTypeRaw = getValue('Fuel Type - Primary');
    const cylinders = getValue('Engine Number of Cylinders');
    const displacementL = getValue('Displacement (L)');

    // Build engine size description from displacement and cylinders
    let engineSize: string | null = null;
    if (displacementL || cylinders) {
      const parts: string[] = [];
      if (displacementL) parts.push(`${displacementL}L`);
      if (cylinders) parts.push(`${cylinders}cyl`);
      engineSize = parts.join(' ');
    }

    return {
      make: getValue('Make'),
      model: getValue('Model'),
      year: yearStr ? parseInt(yearStr, 10) : null,
      engineType: this.mapFuelTypeToEngineType(fuelTypeRaw),
      engineSize,
      fuelType: fuelTypeRaw,
      bodyType: getValue('Body Class'),
      driveType: getValue('Drive Type'),
      transmission: getValue('Transmission Style'),
    };
  }

  /**
   * Get all vehicle makes. Results are cached in memory for 1 hour.
   */
  async getAllMakes(): Promise<VehicleMake[]> {
    const now = Date.now();

    if (this.makesCache && now - this.makesCacheTimestamp < MAKES_CACHE_TTL_MS) {
      this.logger.debug('Returning cached makes list');
      return this.makesCache;
    }

    this.logger.log('Fetching all makes from NHTSA (cache miss)');
    const url = `${NHTSA_BASE_URL}/getallmakes?format=json`;
    const data = await this.fetchJson<{ Results: NhtsaMakeResult[] }>(url);

    this.makesCache = (data.Results ?? [])
      .filter((r) => r.Make_Name)
      .map((r) => ({
        id: r.Make_ID,
        name: r.Make_Name,
      }));
    this.makesCacheTimestamp = now;

    this.logger.log(`Cached ${this.makesCache.length} makes`);
    return this.makesCache;
  }

  /**
   * Get all models for a given make.
   */
  async getModelsByMake(make: string): Promise<VehicleModel[]> {
    const encoded = encodeURIComponent(make.trim());
    const url = `${NHTSA_BASE_URL}/getmodelsformake/${encoded}?format=json`;

    this.logger.log(`Fetching models for make: ${make}`);
    const data = await this.fetchJson<{ Results: NhtsaModelResult[] }>(url);

    return (data.Results ?? []).map((r) => ({
      id: r.Model_ID,
      name: r.Model_Name,
    }));
  }

  /**
   * Map NHTSA fuel type strings to our internal engine type identifiers.
   */
  private mapFuelTypeToEngineType(fuelType: string | null): string | null {
    if (!fuelType) return null;

    const lower = fuelType.toLowerCase();

    if (lower.includes('gasoline')) return 'petrol';
    if (lower.includes('diesel')) return 'diesel';
    if (lower.includes('electric')) return 'electric';
    if (lower.includes('hybrid')) return 'hybrid';
    if (lower.includes('ethanol') || lower.includes('flex')) return 'flex';
    if (lower.includes('hydrogen') || lower.includes('fuel cell')) return 'hydrogen';
    if (lower.includes('natural gas') || lower.includes('cng') || lower.includes('lpg'))
      return 'gas';

    return fuelType;
  }

  /**
   * Generic fetch helper with error handling.
   */
  private async fetchJson<T>(url: string): Promise<T> {
    let response: Response;

    try {
      response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
    } catch (error) {
      this.logger.error(`NHTSA API request failed: ${error}`);
      throw new BadRequestException('Failed to reach NHTSA API. Please try again later.');
    }

    if (!response.ok) {
      this.logger.error(`NHTSA API returned status ${response.status}`);
      throw new BadRequestException(
        `NHTSA API returned an error (HTTP ${response.status}).`,
      );
    }

    return response.json() as Promise<T>;
  }
}
