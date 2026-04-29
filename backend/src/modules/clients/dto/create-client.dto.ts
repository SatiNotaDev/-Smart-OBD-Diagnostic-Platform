import { IsString, IsOptional, IsEmail, MaxLength } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  phone?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(200)
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;
}
