import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSandboxTemplateDto {
    @IsString()
    @IsNotEmpty()
    baseImage: string; // e.g., "e2b/node:18"

    @IsOptional()
    services?: Record<string, any>;

    @IsOptional()
    envSchema?: Record<string, any>;
}
