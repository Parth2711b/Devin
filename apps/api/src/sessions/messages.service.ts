import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMessageDto } from './dto/create-message.dto.js';

@Injectable()
export class MessagesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(sessionId: string, dto: CreateMessageDto) {
        return this.prisma.db.orm.public.Message.create({
            sessionId,
            role: dto.role,
            summaryText: dto.summaryText,
            rawTrace: dto.rawTrace ?? null,
        });
    }

    async findAllForSession(sessionId: string) {
        return this.prisma.db.orm.public.Message.where({ sessionId }).all();
    }
}
