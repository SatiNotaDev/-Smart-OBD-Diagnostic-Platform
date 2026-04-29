import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('vehicles/:vehicleId/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async findAll(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notesService.findAll(vehicleId, userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateNoteDto,
  ) {
    return this.notesService.create(vehicleId, userId, dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notesService.update(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notesService.remove(id, userId);
  }
}
