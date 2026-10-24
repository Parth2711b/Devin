export interface CommandResult {
    stdout: string;
    stderr: string;
    exitCode: number;
}

export interface ISandbox {
    init(): Promise<void>;
    runCommand(command: string): Promise<CommandResult>;
    readFile(path: string): Promise<string>;
    writeFile(path: string, content: string): Promise<{ diff: string }>;
    listFiles(dirPath?: string): Promise<string[]>;
    getWorkspacePath(): string;
}
