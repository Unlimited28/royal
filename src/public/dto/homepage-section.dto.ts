import { IsString, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHomepageSectionDto {
  @ApiProperty({ example: 'hero' })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({ example: 'Welcome to OGBC RA' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: '# Hero content...' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateHomepageSectionDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
