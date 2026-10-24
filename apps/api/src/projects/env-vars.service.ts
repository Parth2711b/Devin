import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEnvVarDto } from './dto/create-env-var.dto.js';

@Injectable()
export class EnvVarsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(projectId: string, dto: CreateEnvVarDto) {
        const existing = await this.prisma.db.orm.public.EnvVar.first({
            projectId,
            key: dto.key,
            scope: dto.scope,
        });

        if (existing) {
            throw new ConflictException(`Env var "${dto.key}" already exists for scope "${dto.scope}"`);
        }

        return this.prisma.db.orm.public.EnvVar.create({
            projectId,
            key: dto.key,
            value: dto.value,
            scope: dto.scope,
            updatedAt: Temporal.Now.instant(),
        });
    }

    async findAllForProject(projectId: string) {
        return this.prisma.db.orm.public.EnvVar.where({ projectId }).all();
    }

    async remove(id: string) {
        const envVar = await this.prisma.db.orm.public.EnvVar.first({ id });
        if (!envVar) {
            throw new NotFoundException(`Env var ${id} not found`);
        }
        await this.prisma.db.orm.public.EnvVar.where({ id }).delete();
        return { success: true, message: `Env var ${id} deleted` };
    }
}
