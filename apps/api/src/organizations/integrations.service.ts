import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateIntegrationDto } from './dto/create-integration.dto.js';

@Injectable()
export class IntegrationsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(organizationId: string, dto: CreateIntegrationDto) {
        return this.prisma.db.orm.public.Integration.create({
            organizationId,
            provider: dto.provider,
            installationId: dto.installationId,
            config: dto.config ?? null,
            updatedAt: Temporal.Now.instant(),
        });
    }

    async findAllForOrg(organizationId: string) {
        return this.prisma.db.orm.public.Integration.where({ organizationId }).all();
    }

    async remove(id: string) {
        const integration = await this.prisma.db.orm.public.Integration.first({ id });
        if (!integration) {
            throw new NotFoundException(`Integration ${id} not found`);
        }
        await this.prisma.db.orm.public.Integration.where({ id }).delete();
        return { success: true, message: `Integration ${id} removed` };
    }
}
