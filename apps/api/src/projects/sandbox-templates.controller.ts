import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard.js';
import { SandboxTemplatesService } from './sandbox-templates.service.js';
import { CreateSandboxTemplateDto } from './dto/create-template.dto.js';

@Controller('projects/:projectId/templates')
@UseGuards(JwtAuthGuard)
export class SandboxTemplatesController {
    constructor(private readonly templatesService: SandboxTemplatesService) { }

    @Post()
    create(@Param('projectId') projectId: string, @Body() dto: CreateSandboxTemplateDto) {
        return this.templatesService.create(projectId, dto);
    }

    @Get()
    findAll(@Param('projectId') projectId: string) {
        return this.templatesService.findAllForProject(projectId);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.templatesService.remove(id);
    }
}
