import { IsString, IsOptional, IsInt, IsDateString, IsIn, MaxLength } from 'class-validator';

export class CreateReminderDto {
  @IsString()
  vehicleId: string;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsIn(['MILEAGE', 'DATE', 'BOTH'])
  type: 'MILEAGE' | 'DATE' | 'BOTH';

  @IsOptional()
  @IsInt()
  dueMileage?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
