import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard.js';
import { EnvVarsService } from './env-vars.service.js';
import { CreateEnvVarDto } from './dto/create-env-var.dto.js';

@Controller('projects/:projectId/env-vars')
@UseGuards(JwtAuthGuard)
export class EnvVarsController {
    constructor(private readonly envVarsService: EnvVarsService) { }

    @Post()
    create(@Param('projectId') projectId: string, @Body() dto: CreateEnvVarDto) {
        return this.envVarsService.create(projectId, dto);
    }

    @Get()
    findAll(@Param('projectId') projectId: string) {
        return this.envVarsService.findAllForProject(projectId);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.envVarsService.remove(id);
    }
}
