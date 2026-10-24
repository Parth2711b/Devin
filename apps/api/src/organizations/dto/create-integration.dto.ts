import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateIntegrationDto {
    @IsString()
    @IsNotEmpty()
    provider: string; // e.g. "github"

    @IsString()
    @IsNotEmpty()
    installationId: string;

    @IsOptional()
    config?: Record<string, any>;
}
