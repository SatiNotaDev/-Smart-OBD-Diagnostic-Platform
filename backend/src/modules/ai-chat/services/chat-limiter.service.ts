import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const DAILY_LIMITS: Record<string, number> = {
  FREE: 10,
  PRO: 100,
  BUSINESS: Infinity,
};

@Injectable()
export class ChatLimiterService {
  constructor(private readonly prisma: PrismaService) {}

  async checkLimit(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    const plan = user?.plan || 'FREE';
    const limit = DAILY_LIMITS[plan] ?? 10;

    if (limit === Infinity) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const count = await this.prisma.chatMessage.count({
      where: {
        role: 'USER',
        createdAt: { gte: todayStart },
        chat: {
          vehicle: { userId },
        },
      },
    });

    if (count >= limit) {
      throw new ForbiddenException(
        `Daily message limit reached (${limit} messages for ${plan} plan). Upgrade your plan for more.`,
      );
    }
  }

  async getUsage(userId: string): Promise<{ used: number; limit: number; plan: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    const plan = user?.plan || 'FREE';
    const limit = DAILY_LIMITS[plan] ?? 10;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const used = await this.prisma.chatMessage.count({
      where: {
        role: 'USER',
        createdAt: { gte: todayStart },
        chat: {
          vehicle: { userId },
        },
      },
    });

    return { used, limit: limit === Infinity ? -1 : limit, plan };
  }
}
