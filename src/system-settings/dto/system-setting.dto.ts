import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSystemSettingDto {
  @ApiProperty({ example: true })
  @IsNotEmpty()
  value!: any;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
