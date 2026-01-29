import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGalleryItemDto {
  @ApiProperty({ example: 'Annual Convention 2024' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Photos from the main event.', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'convention-2024' })
  @IsString()
  @IsNotEmpty()
  eventTag!: string;
}

export class UpdateGalleryItemDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  eventTag?: string;
}
