import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard.js';
import { IntegrationsService } from './integrations.service.js';
import { CreateIntegrationDto } from './dto/create-integration.dto.js';

@Controller('orgs/:orgId/integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
    constructor(private readonly integrationsService: IntegrationsService) { }

    @Post()
    create(@Param('orgId') orgId: string, @Body() dto: CreateIntegrationDto) {
        return this.integrationsService.create(orgId, dto);
    }

    @Get()
    findAll(@Param('orgId') orgId: string) {
        return this.integrationsService.findAllForOrg(orgId);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.integrationsService.remove(id);
    }
}
