import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller.js';
import { OrganizationsService } from './organizations.service.js';
import { MembershipsController } from './memberships.controller.js';
import { MembershipsService } from './memberships.service.js';
import { IntegrationsController } from './integrations.controller.js';
import { IntegrationsService } from './integrations.service.js';

@Module({
    controllers: [
        OrganizationsController,
        MembershipsController,
        IntegrationsController,
    ],
    providers: [
        OrganizationsService,
        MembershipsService,
        IntegrationsService,
    ],
    exports: [
        OrganizationsService,
        MembershipsService,
        IntegrationsService,
    ],
})
export class OrganizationsModule { }
