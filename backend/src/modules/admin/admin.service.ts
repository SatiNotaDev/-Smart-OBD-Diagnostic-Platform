import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [
      totalUsers,
      usersThisWeek,
      usersThisMonth,
      totalVehicles,
      totalScans,
      scansToday,
      totalMessages,
      messagesToday,
      planCounts,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      this.prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
      this.prisma.vehicle.count(),
      this.prisma.diagnosticSession.count(),
      this.prisma.diagnosticSession.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.chatMessage.count({ where: { role: 'USER' } }),
      this.prisma.chatMessage.count({ where: { role: 'USER', createdAt: { gte: todayStart } } }),
      this.prisma.user.groupBy({ by: ['plan'], _count: true }),
    ]);

    return {
      users: {
        total: totalUsers,
        thisWeek: usersThisWeek,
        thisMonth: usersThisMonth,
        byPlan: planCounts.reduce((acc, p) => ({ ...acc, [p.plan]: p._count }), {}),
      },
      vehicles: { total: totalVehicles },
      diagnostics: { total: totalScans, today: scansToday },
      aiChat: { totalMessages, messagesToday },
    };
  }

  async getUsers(page = 1, limit = 20, search?: string) {
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          plan: true,
          isEmailVerified: true,
          createdAt: true,
          _count: { select: { vehicles: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateUserPlan(userId: string, plan: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { plan: plan as any },
      select: { id: true, email: true, plan: true },
    });
  }

  async deleteUser(userId: string) {
    return this.prisma.user.delete({ where: { id: userId } });
  }

  async getTopDtcCodes(limit = 10) {
    const codes = await this.prisma.dtcCode.groupBy({
      by: ['code'],
      _count: true,
      orderBy: { _count: { code: 'desc' } },
      take: limit,
    });

    return codes.map((c) => ({ code: c.code, count: c._count }));
  }

  async getAiUsageByUser(limit = 10) {
    const usage = await this.prisma.chatMessage.groupBy({
      by: ['chatId'],
      where: { role: 'USER' },
      _count: true,
      orderBy: { _count: { chatId: 'desc' } },
      take: limit * 2,
    });

    const chatIds = usage.map((u) => u.chatId);
    const chats = await this.prisma.aiChat.findMany({
      where: { id: { in: chatIds } },
      include: { vehicle: { select: { userId: true, user: { select: { email: true, name: true } } } } },
    });

    const userMap = new Map<string, { email: string; name: string | null; count: number }>();
    for (const u of usage) {
      const chat = chats.find((c) => c.id === u.chatId);
      if (!chat) continue;
      const uid = chat.vehicle.userId;
      const existing = userMap.get(uid);
      if (existing) {
        existing.count += u._count;
      } else {
        userMap.set(uid, {
          email: chat.vehicle.user.email,
          name: chat.vehicle.user.name,
          count: u._count,
        });
      }
    }

    return [...userMap.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}
