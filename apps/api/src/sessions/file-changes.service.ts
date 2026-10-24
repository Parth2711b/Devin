import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateFileChangeDto } from './dto/create-file-change.dto.js';

@Injectable()
export class FileChangesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(sessionId: string, dto: CreateFileChangeDto) {
        return this.prisma.db.orm.public.FileChange.create({
            sessionId,
            filePath: dto.filePath,
            diff: dto.diff,
            status: dto.status ?? 'PENDING',
            updatedAt: Temporal.Now.instant(),
        });
    }

    async findAllForSession(sessionId: string) {
        return this.prisma.db.orm.public.FileChange.where({ sessionId }).all();
    }

    async updateStatus(id: string, status: 'PENDING' | 'COMMITTED') {
        const fileChange = await this.prisma.db.orm.public.FileChange.first({ id });
        if (!fileChange) {
            throw new NotFoundException(`FileChange ${id} not found`);
        }

        return this.prisma.db.orm.public.FileChange.where({ id }).update({
            status,
            updatedAt: Temporal.Now.instant(),
        });
    }
}
