import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum FileChangeStatus {
    PENDING = 'PENDING',
    COMMITTED = 'COMMITTED',
}

export class CreateFileChangeDto {
    @IsString()
    @IsNotEmpty()
    filePath: string;

    @IsString()
    @IsNotEmpty()
    diff: string;

    @IsEnum(FileChangeStatus)
    @IsOptional()
    status?: FileChangeStatus;
}
