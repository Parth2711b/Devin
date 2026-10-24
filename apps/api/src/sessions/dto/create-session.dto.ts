import { IsOptional, IsString } from 'class-validator';

export class CreateSessionDto {
    @IsString()
    @IsOptional()
    sandboxId?: string;
}
