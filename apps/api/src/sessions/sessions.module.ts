import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller.js';
import { SessionsService } from './sessions.service.js';
import { MessagesController } from './messages.controller.js';
import { MessagesService } from './messages.service.js';
import { FileChangesController } from './file-changes.controller.js';
import { FileChangesService } from './file-changes.service.js';
import { SandboxPreviewController } from './sandbox-preview.controller.js';

@Module({
    controllers: [
        SessionsController,
        MessagesController,
        FileChangesController,
        SandboxPreviewController,
    ],
    providers: [
        SessionsService,
        MessagesService,
        FileChangesService,
    ],
    exports: [
        SessionsService,
        MessagesService,
        FileChangesService,
    ],
})
export class SessionsModule { }
