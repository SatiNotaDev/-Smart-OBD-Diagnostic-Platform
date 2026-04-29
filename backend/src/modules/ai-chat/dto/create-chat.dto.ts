import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateChatDto {
  @IsString()
  vehicleId: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;
}
