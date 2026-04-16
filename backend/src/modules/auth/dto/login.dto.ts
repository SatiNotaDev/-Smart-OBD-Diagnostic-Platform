import { IsEmail, IsString, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  mfaCode?: string; // For MFA verification
}
