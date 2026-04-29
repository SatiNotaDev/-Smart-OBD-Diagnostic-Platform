import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DiagnosticsService } from './diagnostics.service';
import { DiagnosticReportService } from './services/diagnostic-report.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('diagnostics')
export class DiagnosticsController {
  constructor(
    private readonly diagnosticsService: DiagnosticsService,
    private readonly reportService: DiagnosticReportService,
  ) {}

  @Get('vehicle/:vehicleId')
  async findAll(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.diagnosticsService.findAll(vehicleId, userId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.diagnosticsService.findOne(id, userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSessionDto,
  ) {
    return this.diagnosticsService.create(userId, dto);
  }

  @Get(':id/pdf')
  async exportPdf(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Res() res: Response,
  ) {
    const session = await this.diagnosticsService.findOne(id, userId);
    const pdfBuffer = await this.reportService.generateReport(session);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="diagnostic-report-${id.slice(0, 8)}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.diagnosticsService.remove(id, userId);
  }
}
