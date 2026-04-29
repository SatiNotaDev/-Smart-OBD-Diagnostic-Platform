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
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get('vehicle/:vehicleId')
  async findAll(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.remindersService.findAll(vehicleId, userId);
  }

  @Get('due')
  async getDue(@CurrentUser('id') userId: string) {
    return this.remindersService.getDueReminders(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReminderDto,
  ) {
    return this.remindersService.create(userId, dto);
  }

  @Patch(':id/complete')
  async complete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.remindersService.complete(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.remindersService.remove(id, userId);
  }
}
