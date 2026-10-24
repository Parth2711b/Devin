import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard.js';
import { MembershipsService } from './memberships.service.js';
import { AddMemberDto } from './dto/add-member.dto.js';

@Controller('orgs/:orgId/members')
@UseGuards(JwtAuthGuard)
export class MembershipsController {
    constructor(private readonly membershipsService: MembershipsService) { }

    @Post()
    addMember(@Param('orgId') orgId: string, @Body() dto: AddMemberDto) {
        return this.membershipsService.addMember(orgId, dto);
    }

    @Get()
    getMembers(@Param('orgId') orgId: string) {
        return this.membershipsService.getMembers(orgId);
    }

    @Patch(':memberId')
    updateRole(@Param('memberId') memberId: string, @Body('role') role: string) {
        return this.membershipsService.updateRole(memberId, role);
    }

    @Delete(':memberId')
    removeMember(@Param('memberId') memberId: string) {
        return this.membershipsService.removeMember(memberId);
    }
}
