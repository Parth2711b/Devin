import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum EnvVarScope {
    SANDBOX = 'SANDBOX',
    PROD = 'PROD',
}

export class CreateEnvVarDto {
    @IsString()
    @IsNotEmpty()
    key: string;

    @IsString()
    @IsNotEmpty()
    value: string;

    @IsEnum(EnvVarScope)
    @IsNotEmpty()
    scope: EnvVarScope;
}
