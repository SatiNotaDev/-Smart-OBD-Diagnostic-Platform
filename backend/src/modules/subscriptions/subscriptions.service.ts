import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);
  private readonly stripe: InstanceType<typeof Stripe> | null;
  private readonly prices: Record<string, string>;
  private readonly webhookSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    this.stripe = secretKey ? new Stripe(secretKey) : null;
    this.webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET') || '';

    this.prices = {
      PRO: this.config.get<string>('STRIPE_PRICE_PRO') || '',
      BUSINESS: this.config.get<string>('STRIPE_PRICE_BUSINESS') || '',
    };

    if (!this.stripe) {
      this.logger.warn('STRIPE_SECRET_KEY not set — subscriptions disabled');
    }
  }

  async createCheckoutSession(userId: string, plan: 'PRO' | 'BUSINESS') {
    if (!this.stripe) {
      throw new BadRequestException('Payment system not configured');
    }

    const priceId = this.prices[plan];
    if (!priceId) {
      throw new BadRequestException(`Price not configured for plan: ${plan}`);
    }

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });
      customerId = customer.id;
      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${frontendUrl}/settings?payment=success`,
      cancel_url: `${frontendUrl}/settings?payment=cancelled`,
      metadata: { userId, plan },
    });

    return { url: session.url };
  }

  async createPortalSession(userId: string) {
    if (!this.stripe) {
      throw new BadRequestException('Payment system not configured');
    }

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!user.stripeCustomerId) {
      throw new BadRequestException('No active subscription');
    }

    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    const session = await this.stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${frontendUrl}/settings`,
    });

    return { url: session.url };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    if (!this.stripe || !this.webhookSecret) return;

    let event: any;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.activateSubscription(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.updateSubscription(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.cancelSubscription(event.data.object);
        break;
    }
  }

  async getCurrentPlan(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { plan: true, planExpiresAt: true, stripeSubId: true },
    });

    return {
      plan: user.plan,
      expiresAt: user.planExpiresAt,
      hasSubscription: !!user.stripeSubId,
    };
  }

  private async activateSubscription(session: any) {
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;
    if (!userId || !plan) return;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        stripeSubId: session.subscription as string,
        planExpiresAt: null,
      },
    });

    this.logger.log(`Subscription activated: user=${userId} plan=${plan}`);
  }

  private async updateSubscription(subscription: any) {
    const user = await this.prisma.user.findFirst({
      where: { stripeSubId: subscription.id },
    });
    if (!user) return;

    const currentPeriodEnd = new Date(subscription.items?.data?.[0]?.current_period_end * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { planExpiresAt: currentPeriodEnd },
    });
  }

  private async cancelSubscription(subscription: any) {
    const user = await this.prisma.user.findFirst({
      where: { stripeSubId: subscription.id },
    });
    if (!user) return;

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        plan: 'FREE',
        stripeSubId: null,
        planExpiresAt: null,
      },
    });

    this.logger.log(`Subscription cancelled: user=${user.id}`);
  }
}
