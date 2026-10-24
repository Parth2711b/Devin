import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard.js';
import { MessagesService } from './messages.service.js';
import { CreateMessageDto } from './dto/create-message.dto.js';

@Controller('sessions/:sessionId/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Post()
    create(@Param('sessionId') sessionId: string, @Body() dto: CreateMessageDto) {
        return this.messagesService.create(sessionId, dto);
    }

    @Get()
    findAll(@Param('sessionId') sessionId: string) {
        return this.messagesService.findAllForSession(sessionId);
    }
}
