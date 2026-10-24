import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './auth.guard.js';
import { GithubStrategy } from './strategies/github.strategy.js';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            global: true,
            secret: process.env['JWT_SECRET'] ?? 'dev-secret-change-me',
            signOptions: { expiresIn: '7d' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, GithubStrategy, JwtAuthGuard],
    exports: [AuthService, JwtAuthGuard],
})
export class AuthModule { }
