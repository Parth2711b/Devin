import { Module } from '@nestjs/common';
import { SessionsModule } from '../sessions/sessions.module.js';
import { AgentService } from './agent.service.js';
import { AgentController } from './agent.controller.js';

@Module({
    imports: [SessionsModule],
    controllers: [AgentController],
    providers: [AgentService],
    exports: [AgentService],
})
export class AgentModule { }
