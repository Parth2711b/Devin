import { tool } from 'ai';
import { z } from 'zod';
import { ISandbox } from '../sandbox/sandbox.interface.js';
import { FileChangesService } from '../../sessions/file-changes.service.js';

export function createAgentTools(
    sandbox: ISandbox,
    sessionId: string,
    fileChangesService: FileChangesService,
) {
    return {
        run_command: tool({
            description: 'Execute a bash command in the project workspace',
            inputSchema: z.object({
                command: z.string().describe('The bash command to run (e.g. "ls -la", "npm test")'),
            }),
            execute: async ({ command }) => {
                const res = await sandbox.runCommand(command);
                return {
                    exitCode: res.exitCode,
                    stdout: res.stdout,
                    stderr: res.stderr,
                };
            },
        }),

        read_file: tool({
            description: 'Read the contents of a file in the workspace',
            inputSchema: z.object({
                path: z.string().describe('Relative path to the file'),
            }),
            execute: async ({ path }) => {
                try {
                    const content = await sandbox.readFile(path);
                    return { content };
                } catch (err: any) {
                    return { error: `Could not read file: ${err.message}` };
                }
            },
        }),

        write_file: tool({
            description: 'Create or update a file in the workspace',
            inputSchema: z.object({
                path: z.string().describe('Relative path to the file'),
                content: z.string().describe('The complete file content to write'),
            }),
            execute: async ({ path, content }) => {
                try {
                    const { diff } = await sandbox.writeFile(path, content);
                    await fileChangesService.create(sessionId, {
                        filePath: path,
                        diff,
                        status: 'COMMITTED' as any,
                    });
                    return { success: true, message: `File ${path} written successfully` };
                } catch (err: any) {
                    return { error: `Failed to write file: ${err.message}` };
                }
            },
        }),

        list_files: tool({
            description: 'List files and directories in the workspace',
            inputSchema: z.object({
                dirPath: z.string().optional().describe('Relative directory path (defaults to root)'),
            }),
            execute: async ({ dirPath }) => {
                const files = await sandbox.listFiles(dirPath);
                return { files };
            },
        }),

        task_complete: tool({
            description: 'Declare that the requested task has been completed and verified',
            inputSchema: z.object({
                summary: z.string().describe('Summary of the work done and verification results'),
            }),
            execute: async ({ summary }) => {
                return { status: 'COMPLETED', summary };
            },
        }),
    };
}
