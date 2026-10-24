import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard.js';
import { SessionsService } from './sessions.service.js';
import { CreateSessionDto } from './dto/create-session.dto.js';
import { UpdateSessionDto } from './dto/update-session.dto.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) { }

    @Post('projects/:projectId/sessions')
    create(@Param('projectId') projectId: string, @Body() dto: CreateSessionDto) {
        return this.sessionsService.create(projectId, dto);
    }

    @Get('projects/:projectId/sessions')
    findAllForProject(@Param('projectId') projectId: string) {
        return this.sessionsService.findAllForProject(projectId);
    }

    @Get('sessions/:id')
    findOne(@Param('id') id: string) {
        return this.sessionsService.findOne(id);
    }

    @Patch('sessions/:id')
    update(@Param('id') id: string, @Body() dto: UpdateSessionDto) {
        return this.sessionsService.update(id, dto);
    }

    @Delete('sessions/:id')
    remove(@Param('id') id: string) {
        return this.sessionsService.remove(id);
    }
}
