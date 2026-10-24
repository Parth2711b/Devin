import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/auth.guard.js';
import { AgentService } from './agent.service.js';

export class PromptDto {
    @IsString()
    @IsNotEmpty()
    prompt: string;
}

@Controller('sessions/:sessionId/prompt')
@UseGuards(JwtAuthGuard)
export class AgentController {
    constructor(private readonly agentService: AgentService) { }

    @Post()
    runPrompt(@Param('sessionId') sessionId: string, @Body() dto: PromptDto) {
        return this.agentService.runTask(sessionId, dto.prompt);
    }
}
