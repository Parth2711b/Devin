import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard.js';
import { OrganizationsService } from './organizations.service.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { UpdateOrganizationDto } from './dto/update-organization.dto.js';

@Controller('orgs')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
    constructor(private readonly orgsService: OrganizationsService) { }

    @Post()
    create(@Body() dto: CreateOrganizationDto, @Req() req: any) {
        return this.orgsService.create(dto, req.user.sub);
    }

    @Get()
    findAll(@Req() req: any) {
        return this.orgsService.findAllForUser(req.user.sub);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.orgsService.findOne(id);
    }

    @Get('slug/:slug')
    findBySlug(@Param('slug') slug: string) {
        return this.orgsService.findBySlug(slug);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
        return this.orgsService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.orgsService.remove(id);
    }
}
