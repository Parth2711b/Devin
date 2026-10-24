import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum MessageRole {
    USER = 'USER',
    AGENT = 'AGENT',
    SYSTEM = 'SYSTEM',
}

export class CreateMessageDto {
    @IsEnum(MessageRole)
    @IsNotEmpty()
    role: MessageRole;

    @IsString()
    @IsNotEmpty()
    summaryText: string;

    @IsOptional()
    rawTrace?: Record<string, any>;
}
