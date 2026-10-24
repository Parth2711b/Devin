import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum OrgRole {
    OWNER = 'OWNER',
    MANAGER = 'MANAGER',
    DEVELOPER = 'DEVELOPER',
    VIEWER = 'VIEWER',
}

export class AddMemberDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsEnum(OrgRole)
    @IsNotEmpty()
    role: OrgRole;
}
