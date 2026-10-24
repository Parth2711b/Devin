import { IsOptional, IsString } from 'class-validator';

export class UpdateProjectDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    repositoryUrl?: string;

    @IsOptional()
    techStack?: Record<string, any>;
}
