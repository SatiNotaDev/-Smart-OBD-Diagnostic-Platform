import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { generateAiResponse } from './services/ai-engine';
import { ChatLimiterService } from './services/chat-limiter.service';

@Injectable()
export class AiChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly limiter: ChatLimiterService,
  ) {}

  async findAll(vehicleId: string, userId: string) {
    await this.verifyVehicleOwnership(vehicleId, userId);

    return this.prisma.aiChat.findMany({
      where: { vehicleId },
      include: { _count: { select: { messages: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const chat = await this.prisma.aiChat.findFirst({
      where: { id },
      include: {
        vehicle: { select: { userId: true, brand: true, model: true, year: true, engineType: true, mileage: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!chat || chat.vehicle.userId !== userId) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }

  async create(userId: string, dto: CreateChatDto) {
    await this.verifyVehicleOwnership(dto.vehicleId, userId);

    return this.prisma.aiChat.create({
      data: {
        vehicleId: dto.vehicleId,
        title: dto.title || 'New Chat',
      },
      include: { _count: { select: { messages: true } } },
    });
  }

  async getUsage(userId: string) {
    return this.limiter.getUsage(userId);
  }

  async sendMessage(chatId: string, userId: string, dto: SendMessageDto) {
    await this.limiter.checkLimit(userId);
    const chat = await this.findOne(chatId, userId);

    // Save user message
    await this.prisma.chatMessage.create({
      data: {
        chatId,
        role: 'USER',
        content: dto.message,
      },
    });

    // Get vehicle context for AI
    const vehicle = chat.vehicle;
    const recentDtcs = await this.getRecentDtcs(chat.vehicleId);

    const messageHistory = chat.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Generate AI response
    const aiResponse = await generateAiResponse(dto.message, {
      vehicle: {
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        engineType: vehicle.engineType,
        mileage: vehicle.mileage,
      },
      recentDtcs,
      messageHistory,
    });

    // Save AI response
    const assistantMessage = await this.prisma.chatMessage.create({
      data: {
        chatId,
        role: 'ASSISTANT',
        content: aiResponse,
      },
    });

    // Update chat title on first message
    if (chat.messages.length === 0) {
      const title = dto.message.slice(0, 50) + (dto.message.length > 50 ? '...' : '');
      await this.prisma.aiChat.update({
        where: { id: chatId },
        data: { title },
      });
    }

    return {
      userMessage: { role: 'USER', content: dto.message },
      assistantMessage: { id: assistantMessage.id, role: 'ASSISTANT', content: aiResponse },
    };
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.aiChat.delete({ where: { id } });
  }

  private async getRecentDtcs(vehicleId: string) {
    const session = await this.prisma.diagnosticSession.findFirst({
      where: { vehicleId },
      include: { dtcs: true },
      orderBy: { createdAt: 'desc' },
    });

    return session?.dtcs.map((d) => ({
      code: d.code,
      description: d.description,
      severity: d.severity,
    })) || [];
  }

  private async verifyVehicleOwnership(vehicleId: string, userId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, userId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }
}
