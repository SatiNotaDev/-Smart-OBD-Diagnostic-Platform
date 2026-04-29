import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @MaxLength(5000)
  content: string;

  @IsEnum(['GENERAL', 'REPAIR', 'MAINTENANCE', 'OBSERVATION', 'REMINDER'])
  @IsOptional()
  category?: string;
}
