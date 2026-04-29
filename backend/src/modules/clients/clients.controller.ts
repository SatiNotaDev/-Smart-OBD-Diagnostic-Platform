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

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

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
}
