import { Module } from '@nestjs/common';
import { AiChatController } from './ai-chat.controller';
import { AiChatService } from './ai-chat.service';
import { ChatLimiterService } from './services/chat-limiter.service';

@Module({
  controllers: [AiChatController],
  providers: [AiChatService, ChatLimiterService],
  exports: [AiChatService],
})
export class AiChatModule {}
