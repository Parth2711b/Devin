import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AddMemberDto } from './dto/add-member.dto.js';

@Injectable()
export class MembershipsService {
    constructor(private readonly prisma: PrismaService) { }

    async addMember(organizationId: string, dto: AddMemberDto) {
        const existing = await this.prisma.db.orm.public.Membership.first({
            userId: dto.userId,
            organizationId,
        });

        if (existing) {
            throw new ConflictException('User is already a member of this organization');
        }

        return this.prisma.db.orm.public.Membership.create({
            organizationId,
            userId: dto.userId,
            role: dto.role,
            updatedAt: Temporal.Now.instant(),
        });
    }

    async getMembers(organizationId: string) {
        return this.prisma.db.orm.public.Membership.where({ organizationId }).all();
    }

    async updateRole(memberId: string, role: string) {
        const member = await this.prisma.db.orm.public.Membership.first({ id: memberId });
        if (!member) {
            throw new NotFoundException(`Member ${memberId} not found`);
        }

        return this.prisma.db.orm.public.Membership.where({ id: memberId }).update({
            role: role as any,
            updatedAt: Temporal.Now.instant(),
        });
    }

    async removeMember(memberId: string) {
        const member = await this.prisma.db.orm.public.Membership.first({ id: memberId });
        if (!member) {
            throw new NotFoundException(`Member ${memberId} not found`);
        }

        await this.prisma.db.orm.public.Membership.where({ id: memberId }).delete();
        return { success: true, message: `Member ${memberId} removed` };
    }
}
