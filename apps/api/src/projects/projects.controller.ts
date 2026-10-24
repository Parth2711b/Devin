import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard.js';
import { ProjectsService } from './projects.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post('orgs/:orgId/projects')
    create(@Param('orgId') orgId: string, @Body() dto: CreateProjectDto) {
        return this.projectsService.create(orgId, dto);
    }

    @Get('orgs/:orgId/projects')
    findAllForOrg(@Param('orgId') orgId: string) {
        return this.projectsService.findAllForOrg(orgId);
    }

    @Get('projects/:id')
    findOne(@Param('id') id: string) {
        return this.projectsService.findOne(id);
    }

    @Patch('projects/:id')
    update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
        return this.projectsService.update(id, dto);
    }

    @Delete('projects/:id')
    remove(@Param('id') id: string) {
        return this.projectsService.remove(id);
    }
}
