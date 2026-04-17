import { NotFoundException } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';

const mockVehicle = {
  id: 'v1',
  userId: 'u1',
  brand: 'Toyota',
  model: 'Camry',
  year: 2021,
  engineType: 'petrol',
  vin: null,
  mileage: null,
  color: null,
  licensePlate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function createMockPrisma() {
  return {
    vehicle: {
      findMany: jest.fn().mockResolvedValue([mockVehicle]),
      findFirst: jest.fn().mockResolvedValue(mockVehicle),
      create: jest.fn().mockResolvedValue(mockVehicle),
      update: jest.fn().mockResolvedValue(mockVehicle),
      delete: jest.fn().mockResolvedValue(mockVehicle),
    },
  } as any;
}

describe('VehiclesService', () => {
  let service: VehiclesService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new VehiclesService(prisma);
  });

  describe('findAll', () => {
    it('should return vehicles for a user', async () => {
      const result = await service.findAll('u1');
      expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'u1' }),
        }),
      );
      expect(result).toEqual([mockVehicle]);
    });

    it('should apply search filter across brand, model, vin, licensePlate', async () => {
      await service.findAll('u1', { search: 'toy' });
      const callArgs = prisma.vehicle.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toHaveLength(4);
    });

    it('should apply sort', async () => {
      await service.findAll('u1', { sortBy: 'year', sortOrder: 'desc' });
      const callArgs = prisma.vehicle.findMany.mock.calls[0][0];
      expect(callArgs.orderBy.year).toBe('desc');
    });
  });

  describe('findOne', () => {
    it('should return vehicle when found', async () => {
      const result = await service.findOne('v1', 'u1');
      expect(prisma.vehicle.findFirst).toHaveBeenCalledWith({
        where: { id: 'v1', userId: 'u1' },
      });
      expect(result).toEqual(mockVehicle);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.vehicle.findFirst.mockResolvedValueOnce(null);
      await expect(service.findOne('v999', 'u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a vehicle with userId', async () => {
      const dto = { brand: 'Honda', model: 'Civic', year: 2022, engineType: 'petrol' };
      await service.create('u1', dto);
      expect(prisma.vehicle.create).toHaveBeenCalledWith({
        data: { ...dto, userId: 'u1' },
      });
    });
  });

  describe('update', () => {
    it('should enforce userId in where clause', async () => {
      await service.update('v1', 'u1', { brand: 'Lexus' });
      expect(prisma.vehicle.update).toHaveBeenCalledWith({
        where: { id: 'v1', userId: 'u1' },
        data: { brand: 'Lexus' },
      });
    });

    it('should throw if vehicle not owned by user', async () => {
      prisma.vehicle.findFirst.mockResolvedValueOnce(null);
      await expect(service.update('v1', 'u-other', { brand: 'X' })).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.vehicle.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should enforce userId in where clause', async () => {
      await service.remove('v1', 'u1');
      expect(prisma.vehicle.delete).toHaveBeenCalledWith({
        where: { id: 'v1', userId: 'u1' },
      });
    });

    it('should throw if vehicle not owned by user', async () => {
      prisma.vehicle.findFirst.mockResolvedValueOnce(null);
      await expect(service.remove('v1', 'u-other')).rejects.toThrow(NotFoundException);
      expect(prisma.vehicle.delete).not.toHaveBeenCalled();
    });
  });
});
