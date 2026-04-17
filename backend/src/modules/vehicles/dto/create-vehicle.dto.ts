import { IsString, IsInt, IsOptional, Min, Max, MaxLength } from 'class-validator';

const CURRENT_YEAR = new Date().getFullYear();

export class CreateVehicleDto {
  @IsString()
  @MaxLength(100)
  brand: string;

  @IsString()
  @MaxLength(100)
  model: string;

  @IsInt()
  @Min(1900)
  @Max(CURRENT_YEAR + 1)
  year: number;

  @IsString()
  @MaxLength(50)
  engineType: string;

  @IsString()
  @IsOptional()
  @MaxLength(17)
  vin?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  mileage?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  color?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  licensePlate?: string;
}
