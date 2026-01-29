import { IsString, IsEnum, IsNumber, IsUrl, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ enum: ['dues', 'exam', 'camp'] })
  @IsEnum(['dues', 'exam', 'camp'])
  type!: string;

  @ApiProperty()
  @IsNumber()
  amount!: number;

  @ApiProperty()
  @IsUrl()
  receiptUrl!: string;
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
