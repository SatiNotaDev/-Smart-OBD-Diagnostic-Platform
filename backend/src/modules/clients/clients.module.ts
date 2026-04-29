import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { ClientReportService } from './services/client-report.service';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService, ClientReportService],
  exports: [ClientsService],
})
export class ClientsModule {}
