import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard.js';
import { FileChangesService } from './file-changes.service.js';
import { CreateFileChangeDto } from './dto/create-file-change.dto.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class FileChangesController {
    constructor(private readonly fileChangesService: FileChangesService) { }

    @Post('sessions/:sessionId/file-changes')
    create(@Param('sessionId') sessionId: string, @Body() dto: CreateFileChangeDto) {
        return this.fileChangesService.create(sessionId, dto);
    }

    @Get('sessions/:sessionId/file-changes')
    findAll(@Param('sessionId') sessionId: string) {
        return this.fileChangesService.findAllForSession(sessionId);
    }

    @Patch('file-changes/:id')
    updateStatus(@Param('id') id: string, @Body('status') status: 'PENDING' | 'COMMITTED') {
        return this.fileChangesService.updateStatus(id, status);
    }
}
