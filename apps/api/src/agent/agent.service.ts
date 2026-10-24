import { Injectable, NotFoundException } from '@nestjs/common';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, isStepCount } from 'ai';

const google = createGoogleGenerativeAI({
    apiKey: process.env['GEMINI_API_KEY'] || process.env['GOOGLE_GENERATIVE_AI_API_KEY'],
});
import { PrismaService } from '../prisma/prisma.service.js';
import { SessionsService } from '../sessions/sessions.service.js';
import { MessagesService } from '../sessions/messages.service.js';
import { FileChangesService } from '../sessions/file-changes.service.js';
import { LocalSandbox } from './sandbox/local.sandbox.js';
import { createAgentTools } from './tools/agent-tools.js';
import { DEVIN_SYSTEM_PROMPT } from './prompts/devin.prompt.js';

@Injectable()
export class AgentService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly sessionsService: SessionsService,
        private readonly messagesService: MessagesService,
        private readonly fileChangesService: FileChangesService,
    ) { }

    async runTask(sessionId: string, prompt: string) {
        // 1. Verify session exists
        const session = await this.sessionsService.findOne(sessionId);
        if (!session) {
            throw new NotFoundException(`Session ${sessionId} not found`);
        }

        // 2. Mark session as RUNNING
        await this.sessionsService.update(sessionId, { status: 'RUNNING' as any });

        // 3. Save User message to database
        await this.messagesService.create(sessionId, {
            role: 'USER' as any,
            summaryText: prompt,
        });

        // 4. Initialize Local Sandbox
        const sandbox = new LocalSandbox(sessionId);
        await sandbox.init();

        // 5. Fetch previous session history (Pruned to last 8 messages for token conservation)
        const history = await this.messagesService.findAllForSession(sessionId);
        const prunedHistory = history.slice(-8);
        const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = prunedHistory.map((m: any) => ({
            role: m.role === 'USER' ? 'user' : 'assistant',
            content: m.summaryText,
        }));

        const tools = createAgentTools(sandbox, sessionId, this.fileChangesService);

        try {
            // 6. Run autonomous ReAct loop with Gemini (Max 10 steps for optimal token budget)
            const result = await generateText({
                model: google('gemini-3.5-flash-lite'),
                system: DEVIN_SYSTEM_PROMPT,
                messages,
                tools,
                stopWhen: isStepCount(10),
                onStepFinish: async (step) => {
                    // Save each step's thoughts & tool actions to DB
                    const stepSummary = step.text || (step.toolCalls && step.toolCalls.length > 0
                        ? `Executing: ${step.toolCalls.map((t: any) => t.toolName).join(', ')}`
                        : null);

                    if (stepSummary) {
                        await this.messagesService.create(sessionId, {
                            role: 'AGENT' as any,
                            summaryText: stepSummary,
                            rawTrace: {
                                toolCalls: step.toolCalls,
                                toolResults: step.toolResults,
                            },
                        });
                    }
                },
            });

            // 7. Mark session as IDLE (completed)
            await this.sessionsService.update(sessionId, { status: 'IDLE' as any });

            return {
                sessionId,
                status: 'COMPLETED',
                finalResponse: result.text,
                stepsCount: result.steps.length,
            };
        } catch (error: any) {
            // On error, mark session STOPPED
            await this.sessionsService.update(sessionId, { status: 'STOPPED' as any });
            await this.messagesService.create(sessionId, {
                role: 'SYSTEM' as any,
                summaryText: `Agent encountered error: ${error.message}`,
            });
            throw error;
        }
    }
}
