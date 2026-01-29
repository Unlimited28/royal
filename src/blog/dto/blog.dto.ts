import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBlogDto {
  @ApiProperty({ example: 'The Future of Youth Ambassadors' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'future-of-youth-ambassadors', required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: '# Heading\nContent in markdown...' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ enum: ['draft', 'published'], default: 'draft' })
  @IsEnum(['draft', 'published'])
  @IsOptional()
  status?: string;
}

export class UpdateBlogDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ enum: ['draft', 'published'], required: false })
  @IsEnum(['draft', 'published'])
  @IsOptional()
  status?: string;
}
