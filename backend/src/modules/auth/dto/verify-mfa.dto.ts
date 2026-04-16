import { IsString, Length } from 'class-validator';

export class VerifyMfaDto {
  @IsString()
  @Length(6, 6, { message: 'MFA code must be 6 digits' })
  code: string;
}
