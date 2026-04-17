import { Module } from '@nestjs/common';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { NhtsaService } from './services/nhtsa.service';

@Module({
  controllers: [VehiclesController],
  providers: [VehiclesService, NhtsaService],
  exports: [VehiclesService, NhtsaService],
})
export class VehiclesModule {}
