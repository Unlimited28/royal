import { IsString, IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class QuestionDto {
  @ApiProperty()
  @IsString()
  text!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  options!: string[];

  @ApiProperty()
  @IsNumber()
  correctAnswer!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  points?: number;
}

export class CreateExamDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  targetRank!: string;

  @ApiProperty()
  @IsNumber()
  duration_minutes!: number;

  @ApiProperty()
  @IsNumber()
  pass_score!: number;

  @ApiProperty({ type: [QuestionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions!: QuestionDto[];
}
