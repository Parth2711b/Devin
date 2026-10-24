import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSessionDto } from './dto/create-session.dto.js';
import { UpdateSessionDto } from './dto/update-session.dto.js';

@Injectable()
export class SessionsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(projectId: string, dto: CreateSessionDto) {
        return this.prisma.db.orm.public.Session.create({
            projectId,
            sandboxId: dto.sandboxId ?? null,
            status: 'IDLE',
            updatedAt: Temporal.Now.instant(),
        });
    }

    async findAllForProject(projectId: string) {
        return this.prisma.db.orm.public.Session.where({ projectId }).all();
    }

    async findOne(id: string) {
        const session = await this.prisma.db.orm.public.Session.first({ id });
        if (!session) {
            throw new NotFoundException(`Session ${id} not found`);
        }
        return session;
    }

    async update(id: string, dto: UpdateSessionDto) {
        await this.findOne(id);
        return this.prisma.db.orm.public.Session.where({ id }).update({
            ...dto,
            updatedAt: Temporal.Now.instant(),
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        await this.prisma.db.orm.public.Session.where({ id }).delete();
        return { success: true, message: `Session ${id} deleted` };
    }
}
