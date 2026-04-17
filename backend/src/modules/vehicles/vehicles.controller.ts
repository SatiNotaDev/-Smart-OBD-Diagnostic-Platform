import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { NhtsaService } from './services/nhtsa.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('vehicles')
export class VehiclesController {
  constructor(
    private readonly vehiclesService: VehiclesService,
    private readonly nhtsaService: NhtsaService,
  ) {}

  // ─── Public Lookup Endpoints (MUST be before :id route) ──────────

  /**
   * GET /vehicles/lookup/vin/:vin
   * Decode a VIN using the NHTSA vPIC API (public, no auth required)
   */
  @Public()
  @Get('lookup/vin/:vin')
  async lookupVin(@Param('vin') vin: string) {
    return this.nhtsaService.decodeVin(vin);
  }

  /**
   * GET /vehicles/lookup/makes
   * List all vehicle makes (public, no auth required)
   * Optional ?search= query param to filter by name
   */
  @Public()
  @Get('lookup/makes')
  async lookupMakes(@Query('search') search?: string) {
    const makes = await this.nhtsaService.getAllMakes();

    if (search) {
      const lower = search.toLowerCase();
      return makes.filter((m) => m.name?.toLowerCase().includes(lower));
    }

    return makes;
  }

  /**
   * GET /vehicles/lookup/models/:make
   * List all models for a given make (public, no auth required)
   */
  @Public()
  @Get('lookup/models/:make')
  async lookupModels(@Param('make') make: string) {
    return this.nhtsaService.getModelsByMake(make);
  }

  // ─── Authenticated CRUD Endpoints ────────────────────────────────

  /**
   * GET /vehicles
   * List all vehicles for the current user
   */
  @Get()
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'brand' | 'model' | 'year' | 'createdAt',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.vehiclesService.findAll(userId, { search, sortBy, sortOrder });
  }

  /**
   * GET /vehicles/:id
   * Get a single vehicle (ownership verified)
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.vehiclesService.findOne(id, userId);
  }

  /**
   * POST /vehicles
   * Create a new vehicle
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateVehicleDto,
  ) {
    return this.vehiclesService.create(userId, dto);
  }

  /**
   * PATCH /vehicles/:id
   * Update a vehicle (ownership verified)
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(id, userId, dto);
  }

  /**
   * DELETE /vehicles/:id
   * Delete a vehicle (ownership verified)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.vehiclesService.remove(id, userId);
  }
}
