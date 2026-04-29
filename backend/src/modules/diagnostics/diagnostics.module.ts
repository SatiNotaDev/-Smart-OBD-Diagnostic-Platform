import { Module } from '@nestjs/common';
import { DiagnosticsController } from './diagnostics.controller';
import { DiagnosticsService } from './diagnostics.service';
import { DiagnosticReportService } from './services/diagnostic-report.service';

@Module({
  controllers: [DiagnosticsController],
  providers: [DiagnosticsService, DiagnosticReportService],
  exports: [DiagnosticsService],
})
export class DiagnosticsModule {}
