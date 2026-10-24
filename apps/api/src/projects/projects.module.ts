import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';
import { SandboxTemplatesController } from './sandbox-templates.controller.js';
import { SandboxTemplatesService } from './sandbox-templates.service.js';
import { EnvVarsController } from './env-vars.controller.js';
import { EnvVarsService } from './env-vars.service.js';

@Module({
    controllers: [
        ProjectsController,
        SandboxTemplatesController,
        EnvVarsController,
    ],
    providers: [
        ProjectsService,
        SandboxTemplatesService,
        EnvVarsService,
    ],
    exports: [
        ProjectsService,
        SandboxTemplatesService,
        EnvVarsService,
    ],
})
export class ProjectsModule { }
