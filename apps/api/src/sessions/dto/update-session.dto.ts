import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum SessionStatus {
    IDLE = 'IDLE',
    RUNNING = 'RUNNING',
    STOPPED = 'STOPPED',
}

export class UpdateSessionDto {
    @IsEnum(SessionStatus)
    @IsOptional()
    status?: SessionStatus;

    @IsString()
    @IsOptional()
    sandboxId?: string;
}
