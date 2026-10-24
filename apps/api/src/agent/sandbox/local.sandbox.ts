import { exec } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { promisify } from 'node:util';
import { createPatch } from 'diff';
import { CommandResult, ISandbox } from './sandbox.interface.js';

const execAsync = promisify(exec);

export class LocalSandbox implements ISandbox {
    private readonly workspaceDir: string;

    constructor(private readonly sessionId: string) {
        this.workspaceDir = path.resolve(process.cwd(), 'workspaces', this.sessionId);
    }

    async init(): Promise<void> {
        await fs.mkdir(this.workspaceDir, { recursive: true });
    }

    getWorkspacePath(): string {
        return this.workspaceDir;
    }

    async runCommand(command: string): Promise<CommandResult> {
        try {
            const { stdout, stderr } = await execAsync(command, {
                cwd: this.workspaceDir,
                timeout: 30000,
                env: { ...process.env, CI: 'true' },
            });
            return { stdout, stderr, exitCode: 0 };
        } catch (error: any) {
            return {
                stdout: error.stdout ?? '',
                stderr: error.stderr ?? error.message,
                exitCode: error.code ?? 1,
            };
        }
    }

    async readFile(filePath: string): Promise<string> {
        const fullPath = path.resolve(this.workspaceDir, filePath);
        return await fs.readFile(fullPath, 'utf-8');
    }

    async writeFile(filePath: string, content: string): Promise<{ diff: string }> {
        const fullPath = path.resolve(this.workspaceDir, filePath);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });

        let oldContent = '';
        try {
            oldContent = await fs.readFile(fullPath, 'utf-8');
        } catch {
            oldContent = '';
        }

        await fs.writeFile(fullPath, content, 'utf-8');
        const diff = createPatch(filePath, oldContent, content);
        return { diff };
    }

    async listFiles(dirPath = '.'): Promise<string[]> {
        const fullPath = path.resolve(this.workspaceDir, dirPath);
        try {
            const entries = await fs.readdir(fullPath, { recursive: true });
            return entries.map((e) => e.toString());
        } catch {
            return [];
        }
    }
}
