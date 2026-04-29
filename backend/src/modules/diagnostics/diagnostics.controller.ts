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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { DiagnosticsService } from './diagnostics.service';
import { DiagnosticReportService } from './services/diagnostic-report.service';
import { OBDFileParserService } from './services/obd-file-parser.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('diagnostics')
export class DiagnosticsController {
  constructor(
    private readonly diagnosticsService: DiagnosticsService,
    private readonly reportService: DiagnosticReportService,
    private readonly obdParser: OBDFileParserService,
  ) {}

  @Get('stats')
  async getStats(@CurrentUser('id') userId: string) {
    return this.diagnosticsService.getStats(userId);
  }

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

  @Post('upload/:vehicleId')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadFile(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');

    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (!['json', 'csv', 'txt'].includes(ext || '')) {
      throw new BadRequestException('Only .json, .csv, and .txt files are supported');
    }

    const content = file.buffer.toString('utf-8');
    const parsed = this.obdParser.parse(content, ext as string);

    if (parsed.dtcs.length === 0) {
      throw new BadRequestException('No valid DTC codes found in the uploaded file');
    }

    return this.diagnosticsService.create(userId, {
      vehicleId,
      sourceType: ext === 'csv' ? 'CSV' : 'JSON',
      dtcs: parsed.dtcs,
      metrics: parsed.metrics,
    });
  }

  @Post(':id/reanalyze')
  async reanalyze(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.diagnosticsService.reanalyze(id, userId);
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
