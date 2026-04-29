import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('admin')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      search,
    );
  }

  @Patch('users/:id/plan')
  async updateUserPlan(
    @Param('id') id: string,
    @Body('plan') plan: string,
  ) {
    return this.adminService.updateUserPlan(id, plan);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('top-dtc')
  async getTopDtc(@Query('limit') limit?: string) {
    return this.adminService.getTopDtcCodes(limit ? parseInt(limit, 10) : 10);
  }

  @Get('ai-usage')
  async getAiUsage(@Query('limit') limit?: string) {
    return this.adminService.getAiUsageByUser(limit ? parseInt(limit, 10) : 10);
  }
}
