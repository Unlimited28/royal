import { IsUrl, IsEnum, IsDateString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdDto {
  @ApiProperty()
  @IsUrl()
  imageUrl!: string;

  @ApiProperty()
  @IsUrl()
  clickUrl!: string;

  @ApiProperty({ enum: ['homepage', 'dashboard', 'public'] })
  @IsEnum(['homepage', 'dashboard', 'public'])
  placement!: string;

  @ApiProperty()
  @IsDateString()
  startDate!: string;

  @ApiProperty()
  @IsDateString()
  expiryDate!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAdDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  clickUrl?: string;

  @ApiProperty({ enum: ['homepage', 'dashboard', 'public'], required: false })
  @IsOptional()
  @IsEnum(['homepage', 'dashboard', 'public'])
  placement?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
