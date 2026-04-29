import { IsString, IsArray, IsOptional, IsEnum, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class DtcInputDto {
  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  severity?: number;
}

export class MetricInputDto {
  @IsString()
  name: string;

  @IsNumber()
  value: number;

  @IsString()
  @IsOptional()
  unit?: string;
}

export class CreateSessionDto {
  @IsString()
  vehicleId: string;

  @IsEnum(['MANUAL', 'JSON', 'CSV'])
  @IsOptional()
  sourceType?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DtcInputDto)
  dtcs: DtcInputDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetricInputDto)
  @IsOptional()
  metrics?: MetricInputDto[];
}
