import { IsEmail, IsString, IsOptional, MinLength, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'ambassador@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName!: string;

  @ApiProperty({ example: '08012345678', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'First Baptist Church', required: false })
  @IsOptional()
  @IsString()
  church?: string;

  @ApiProperty({ example: 'Ikeja Association' })
  @IsString()
  associationName!: string;

  @ApiProperty({ example: 15, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  age?: number;

  @ApiProperty({ example: 'ambassador', enum: ['ambassador', 'president', 'superadmin'] })
  @IsString()
  role!: string;

  @ApiProperty({ example: 'presaccess123', required: false })
  @IsOptional()
  @IsString()
  passcode?: string;
}
