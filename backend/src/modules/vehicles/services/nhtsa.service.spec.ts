import { BadRequestException } from '@nestjs/common';
import { NhtsaService } from './nhtsa.service';

describe('NhtsaService', () => {
  let service: NhtsaService;

  beforeEach(() => {
    service = new NhtsaService();
  });

  describe('decodeVin', () => {
    it('should reject a VIN shorter than 17 chars', async () => {
      await expect(service.decodeVin('ABC123')).rejects.toThrow(BadRequestException);
    });

    it('should reject a VIN with invalid characters (I, O, Q)', async () => {
      await expect(service.decodeVin('IIIIIIIIIIIIIIIII')).rejects.toThrow(BadRequestException);
    });

    it('should reject a VIN longer than 17 chars', async () => {
      await expect(service.decodeVin('1HGBH41JXMN109186X')).rejects.toThrow(BadRequestException);
    });

    it('should trim and uppercase the VIN', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ Results: [] }),
      } as any);

      await service.decodeVin('  1hgbh41jxmn109186  ');

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('1HGBH41JXMN109186'),
        expect.anything(),
      );
      fetchSpy.mockRestore();
    });

    it('should parse decoded results correctly', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          Results: [
            { Variable: 'Make', Value: 'HONDA' },
            { Variable: 'Model', Value: 'Civic' },
            { Variable: 'Model Year', Value: '2021' },
            { Variable: 'Fuel Type - Primary', Value: 'Gasoline' },
            { Variable: 'Engine Number of Cylinders', Value: '4' },
            { Variable: 'Displacement (L)', Value: '1.5' },
            { Variable: 'Body Class', Value: 'Sedan' },
            { Variable: 'Drive Type', Value: 'FWD' },
            { Variable: 'Transmission Style', Value: 'Automatic' },
          ],
        }),
      } as any);

      const result = await service.decodeVin('1HGBH41JXMN109186');

      expect(result.make).toBe('HONDA');
      expect(result.model).toBe('Civic');
      expect(result.year).toBe(2021);
      expect(result.engineType).toBe('petrol');
      expect(result.engineSize).toBe('1.5L 4cyl');
      expect(result.fuelType).toBe('Gasoline');
      expect(result.bodyType).toBe('Sedan');
      expect(result.driveType).toBe('FWD');
      expect(result.transmission).toBe('Automatic');

      jest.restoreAllMocks();
    });

    it('should handle fetch failure', async () => {
      jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

      await expect(service.decodeVin('1HGBH41JXMN109186')).rejects.toThrow(
        BadRequestException,
      );

      jest.restoreAllMocks();
    });
  });

  describe('getAllMakes', () => {
    it('should fetch and cache makes', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          Results: [
            { Make_ID: 1, Make_Name: 'TOYOTA' },
            { Make_ID: 2, Make_Name: 'HONDA' },
          ],
        }),
      } as any);

      const first = await service.getAllMakes();
      const second = await service.getAllMakes();

      expect(first).toHaveLength(2);
      expect(first[0]).toEqual({ id: 1, name: 'TOYOTA' });
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      fetchSpy.mockRestore();
    });

    it('should filter out makes with null names', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          Results: [
            { Make_ID: 1, Make_Name: 'TOYOTA' },
            { Make_ID: 2, Make_Name: null },
            { Make_ID: 3, Make_Name: '' },
          ],
        }),
      } as any);

      // Force cache miss
      (service as any).makesCache = null;
      const makes = await service.getAllMakes();
      expect(makes).toHaveLength(1);
      expect(makes[0].name).toBe('TOYOTA');

      jest.restoreAllMocks();
    });
  });

  describe('getModelsByMake', () => {
    it('should fetch models for a make', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          Results: [
            { Model_ID: 10, Model_Name: 'Camry' },
            { Model_ID: 11, Model_Name: 'Corolla' },
          ],
        }),
      } as any);

      const models = await service.getModelsByMake('Toyota');
      expect(models).toHaveLength(2);
      expect(models[0]).toEqual({ id: 10, name: 'Camry' });

      jest.restoreAllMocks();
    });

    it('should URL-encode the make name', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ Results: [] }),
      } as any);

      await service.getModelsByMake('Mercedes Benz');

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('Mercedes%20Benz'),
        expect.anything(),
      );

      fetchSpy.mockRestore();
    });
  });

  describe('mapFuelTypeToEngineType', () => {
    it.each([
      ['Gasoline', 'petrol'],
      ['Diesel', 'diesel'],
      ['Electric', 'electric'],
      ['Plug-in Hybrid', 'hybrid'],
      ['Flex Fuel', 'flex'],
      ['Hydrogen Fuel Cell', 'hydrogen'],
      ['Compressed Natural Gas (CNG)', 'gas'],
    ])('should map "%s" to "%s"', (input, expected) => {
      const result = (service as any).mapFuelTypeToEngineType(input);
      expect(result).toBe(expected);
    });

    it('should return null for null input', () => {
      expect((service as any).mapFuelTypeToEngineType(null)).toBeNull();
    });
  });
});
