import { IsString, IsArray, IsOptional, IsBoolean, IsDateString, IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'Platform Maintenance' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'The platform will be down for 2 hours.' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  targetRoles?: string[];

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  targetAssociationId?: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  isGlobal?: boolean;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  expiresAt?: Date;
}

export class UpdateAnnouncementDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  targetRoles?: string[];

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  targetAssociationId?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isGlobal?: boolean;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  expiresAt?: Date;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
