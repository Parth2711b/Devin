import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSandboxTemplateDto } from './dto/create-template.dto.js';

@Injectable()
export class SandboxTemplatesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(projectId: string, dto: CreateSandboxTemplateDto) {
        return this.prisma.db.orm.public.SandboxTemplate.create({
            projectId,
            baseImage: dto.baseImage,
            services: dto.services ?? null,
            envSchema: dto.envSchema ?? null,
            updatedAt: Temporal.Now.instant(),
        });
    }

    async findAllForProject(projectId: string) {
        return this.prisma.db.orm.public.SandboxTemplate.where({ projectId }).all();
    }

    async remove(id: string) {
        const template = await this.prisma.db.orm.public.SandboxTemplate.first({ id });
        if (!template) {
            throw new NotFoundException(`Template ${id} not found`);
        }
        await this.prisma.db.orm.public.SandboxTemplate.where({ id }).delete();
        return { success: true, message: `Template ${id} deleted` };
    }
}
