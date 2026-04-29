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
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ClientReportService } from './services/client-report.service';

@Controller('clients')
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly reportService: ClientReportService,
  ) {}

  /**
   * GET /clients
   * List all clients for the current user
   */
  @Get()
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('search') search?: string,
  ) {
    return this.clientsService.findAll(userId, { search });
  }

  /**
   * GET /clients/:id
   * Get a single client with vehicles and recent diagnostics (ownership verified)
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.clientsService.findOne(id, userId);
  }

  /**
   * POST /clients
   * Create a new client
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateClientDto,
  ) {
    return this.clientsService.create(userId, dto);
  }

  /**
   * PATCH /clients/:id
   * Update a client (ownership verified)
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, userId, dto);
  }

  /**
   * DELETE /clients/:id
   * Delete a client (ownership verified)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.clientsService.remove(id, userId);
  }

  /**
   * POST /clients/:id/link-vehicle
   * Link an existing vehicle to this client
   */
  @Post(':id/link-vehicle')
  async linkVehicle(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('vehicleId') vehicleId: string,
  ) {
    return this.clientsService.linkVehicle(id, vehicleId, userId);
  }

  /**
   * Post /clients/:id/unlink-vehicle
   * Remove a vehicle from this client
   */
  @Post(':id/unlink-vehicle')
  async unlinkVehicle(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('vehicleId') vehicleId: string,
  ) {
    return this.clientsService.unlinkVehicle(id, vehicleId, userId);
  }

  /**
   * POST /clients/:id/report
   * Generate AI report for client based on selected diagnostic sessions
   */
  @Post(':id/report')
  async generateReport(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('sessionIds') sessionIds: string[],
  ) {
    return this.reportService.generateReport(id, userId, sessionIds);
  }

  // ─── Client Notes ─────────────────────────────────────────────────────────

  @Get(':id/notes')
  async findNotes(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.clientsService.findNotes(id, userId);
  }

  @Post(':id/notes')
  @HttpCode(HttpStatus.CREATED)
  async createNote(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('content') content: string,
  ) {
    return this.clientsService.createNote(id, userId, content);
  }

  @Patch(':id/notes/:noteId')
  async updateNote(
    @Param('id') id: string,
    @Param('noteId') noteId: string,
    @CurrentUser('id') userId: string,
    @Body('content') content: string,
  ) {
    return this.clientsService.updateNote(id, noteId, userId, content);
  }

  @Delete(':id/notes/:noteId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNote(
    @Param('id') id: string,
    @Param('noteId') noteId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.clientsService.deleteNote(id, noteId, userId);
  }
}
