import { IsIn } from 'class-validator';

export class CreateCheckoutDto {
  @IsIn(['PRO', 'BUSINESS'])
  plan: 'PRO' | 'BUSINESS';
}
