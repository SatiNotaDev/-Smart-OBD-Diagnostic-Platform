import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { SubscriptionsService } from './subscriptions.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('current')
  async getCurrentPlan(@CurrentUser('id') userId: string) {
    return this.subscriptionsService.getCurrentPlan(userId);
  }

  @Post('checkout')
  async createCheckout(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.subscriptionsService.createCheckoutSession(userId, dto.plan);
  }

  @Post('portal')
  async createPortal(@CurrentUser('id') userId: string) {
    return this.subscriptionsService.createPortalSession(userId);
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    await this.subscriptionsService.handleWebhook(req.rawBody!, signature);
    return { received: true };
  }
}
