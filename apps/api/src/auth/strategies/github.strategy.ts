import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { AuthService } from '../auth.service.js';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(private readonly authService: AuthService) {
        super({
            clientID: process.env['GITHUB_CLIENT_ID']!,
            clientSecret: process.env['GITHUB_CLIENT_SECRET']!,
            callbackURL: process.env['GITHUB_CALLBACK_URL']!,
            scope: ['user:email'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any) {
        // GitHub se profile aata hai, hum user find/create karte hain
        return this.authService.validateGithubUser(profile);
    }
}
