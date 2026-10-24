import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateUserDto) {
        const existing = await this.prisma.db.orm.public.User.first({ email: dto.email });
        if (existing) {
            throw new ConflictException(`User with email "${dto.email}" already exists`);
        }

        return await this.prisma.db.orm.public.User.create({
            email: dto.email,
            name: dto.name ?? null,
            githubId: dto.githubId ?? null,
            avatarUrl: dto.avatarUrl ?? null,
            updatedAt: Temporal.Now.instant(),
        });
    }

    async findAll() {
        return await this.prisma.db.orm.public.User.all();
    }

    async findOne(id: string) {
        const user = await this.prisma.db.orm.public.User.first({ id });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async update(id: string, dto: UpdateUserDto) {
        await this.findOne(id);
        const updated = await this.prisma.db.orm.public.User
            .where({ id })
            .update({ ...dto, updatedAt: Temporal.Now.instant() });
        return updated;
    }

    async remove(id: string) {
        await this.findOne(id);
        await this.prisma.db.orm.public.User.where({ id }).delete();
        return { success: true, message: `User ${id} deleted` };
    }
}
