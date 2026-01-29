import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ enum: ['dues', 'exam', 'camp'] })
  @IsEnum(['dues', 'exam', 'camp'])
  @IsString()
  type!: string;

  @ApiProperty()
  @IsString()
  amount!: string; // Using string because multipart/form-data often sends numbers as strings

  @ApiProperty()
  @IsString()
  referenceNote!: string;
}

export class VerifyPaymentDto {
  @ApiProperty({ enum: ['approved', 'rejected'] })
  @IsEnum(['approved', 'rejected'])
  status!: 'approved' | 'rejected';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
