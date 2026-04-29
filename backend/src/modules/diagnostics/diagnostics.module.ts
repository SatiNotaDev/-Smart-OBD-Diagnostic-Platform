import { Module } from '@nestjs/common';
import { DiagnosticsController } from './diagnostics.controller';
import { DiagnosticsService } from './diagnostics.service';
import { DiagnosticReportService } from './services/diagnostic-report.service';
import { AiAnalysisService } from './services/ai-analysis.service';
import { OBDFileParserService } from './services/obd-file-parser.service';

@Module({
  controllers: [DiagnosticsController],
  providers: [DiagnosticsService, DiagnosticReportService, AiAnalysisService, OBDFileParserService],
  exports: [DiagnosticsService],
})
export class DiagnosticsModule {}
