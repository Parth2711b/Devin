import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { UpdateOrganizationDto } from './dto/update-organization.dto.js';

@Injectable()
export class OrganizationsService {
    constructor(private readonly prisma: PrismaService) { }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-');
    }

    async create(dto: CreateOrganizationDto, userId: string) {
        const slug = dto.slug || this.generateSlug(dto.name);

        const existing = await this.prisma.db.orm.public.Organization.first({ slug });
        if (existing) {
            throw new ConflictException(`Organization with slug "${slug}" already exists`);
        }

        const org = await this.prisma.db.orm.public.Organization.create({
            name: dto.name,
            slug,
            updatedAt: Temporal.Now.instant(),
        });

        // Jo user org create karta hai, use automatically OWNER banate hain
        await this.prisma.db.orm.public.Membership.create({
            userId,
            organizationId: org.id,
            role: 'OWNER',
            updatedAt: Temporal.Now.instant(),
        });

        return org;
    }

    async findAllForUser(userId: string) {
        const memberships = await this.prisma.db.orm.public.Membership.where({ userId }).all();
        const orgIds = memberships.map((m: any) => m.organizationId);
        if (orgIds.length === 0) return [];

        const allOrgs = await this.prisma.db.orm.public.Organization.all();
        return allOrgs.filter((org: any) => orgIds.includes(org.id));
    }

    async findOne(id: string) {
        const org = await this.prisma.db.orm.public.Organization.first({ id });
        if (!org) {
            throw new NotFoundException(`Organization with ID "${id}" not found`);
        }
        return org;
    }

    async findBySlug(slug: string) {
        const org = await this.prisma.db.orm.public.Organization.first({ slug });
        if (!org) {
            throw new NotFoundException(`Organization with slug "${slug}" not found`);
        }
        return org;
    }

    async update(id: string, dto: UpdateOrganizationDto) {
        await this.findOne(id);
        return this.prisma.db.orm.public.Organization.where({ id }).update({
            ...dto,
            updatedAt: Temporal.Now.instant(),
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        await this.prisma.db.orm.public.Organization.where({ id }).delete();
        return { success: true, message: `Organization ${id} deleted` };
    }
}
