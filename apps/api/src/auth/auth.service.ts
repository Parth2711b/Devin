import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async validateGithubUser(profile: any) {
        const githubId = profile.id.toString();
        const email = profile.emails?.[0]?.value ?? `${githubId}@github.com`;
        const name = profile.displayName ?? profile.username ?? null;
        const avatarUrl = profile.photos?.[0]?.value ?? null;

        // Pehle check — kya user already exist karta hai?
        let user = await this.prisma.db.orm.public.User
            .where((u) => u.githubId.eq(githubId))
            .first();

        if (!user) {
            // Naya user create karo
            user = await this.prisma.db.orm.public.User.create({
                email,
                name,
                githubId,
                avatarUrl,
                updatedAt: Temporal.Now.instant(),
            });
        }

        return user;
    }

    async login(user: any) {
        const payload = { sub: user.id, email: user.email };
        return {
            access_token: await this.jwtService.signAsync(payload),
            user,
        };
    }

    async getProfile(userId: string) {
        return this.prisma.db.orm.public.User.first({ id: userId });
    }

    async devLogin(email: string) {
        let user = await this.prisma.db.orm.public.User.first({ email });
        if (!user) {
            user = await this.prisma.db.orm.public.User.create({
                email,
                updatedAt: Temporal.Now.instant(),
            });
        }
        return this.login(user);
    }
}
