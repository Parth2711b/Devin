import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';

@Injectable()
export class ProjectsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(organizationId: string, dto: CreateProjectDto) {
        return this.prisma.db.orm.public.Project.create({
            organizationId,
            name: dto.name,
            description: dto.description ?? null,
            repositoryUrl: dto.repositoryUrl ?? null,
            techStack: dto.techStack ?? null,
            updatedAt: Temporal.Now.instant(),
        });
    }

    async findAllForOrg(organizationId: string) {
        return this.prisma.db.orm.public.Project.where({ organizationId }).all();
    }

    async findOne(id: string) {
        const project = await this.prisma.db.orm.public.Project.first({ id });
        if (!project) {
            throw new NotFoundException(`Project ${id} not found`);
        }
        return project;
    }

    async update(id: string, dto: UpdateProjectDto) {
        await this.findOne(id);
        return this.prisma.db.orm.public.Project.where({ id }).update({
            ...dto,
            updatedAt: Temporal.Now.instant(),
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        await this.prisma.db.orm.public.Project.where({ id }).delete();
        return { success: true, message: `Project ${id} deleted` };
    }
}
