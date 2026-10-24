import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './auth.guard.js';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // Step 1: User clicks "Login with GitHub" → redirect to GitHub
    @Get('github')
    @UseGuards(AuthGuard('github'))
    githubLogin() {
        // Passport automatically redirects to GitHub
    }

    // Step 2: GitHub redirects back with code → we get user profile
    @Get('github/callback')
    @UseGuards(AuthGuard('github'))
    async githubCallback(@Req() req: any, @Res() res: any) {
        const result = await this.authService.login(req.user);
        // Token ke saath redirect ya JSON response
        res.json(result);
    }

    // Step 3: Frontend token bhejta hai → user profile milta hai
    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getMe(@Req() req: any) {
        return this.authService.getProfile(req.user.sub);
    }

    // Dev login: Instant token generation for testing
    @Post('dev-login')
    async devLogin(@Body('email') email: string) {
        return this.authService.devLogin(email || 'parth@example.com');
    }
}
