/// <reference types="multer" />
import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentsService } from './payments.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePaymentDto, VerifyPaymentDto } from './dto/payment.dto';
import { RECEIPT_UPLOAD_OPTIONS } from '../common/storage/storage.utils';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('upload')
  @Roles('ambassador', 'president')
  @UseInterceptors(FileInterceptor('receipt', RECEIPT_UPLOAD_OPTIONS))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['dues', 'exam', 'camp'] },
        amount: { type: 'string' },
        referenceNote: { type: 'string' },
        receipt: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a payment receipt' })
  async create(
    @Body() paymentData: CreatePaymentDto,
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Receipt file is required and must be a valid JPG, PNG, or PDF under 5MB');
    }
    return this.paymentsService.create(paymentData, req.user.userId, file);
  }

  @Get('my')
  @Roles('ambassador', 'president')
  @ApiOperation({ summary: 'Get my payment history' })
  getMyPayments(@Request() req: any) {
    return this.paymentsService.findByUserId(req.user.userId);
  }

  @Get()
  @Roles('superadmin', 'president')
  @ApiOperation({ summary: 'Get payments (Super Admin sees all, President sees association)' })
  async findAll(@Request() req: any) {
    if (req.user.roles.includes('superadmin')) {
      return this.paymentsService.findAll();
    } else {
      return this.paymentsService.findByAssociation(req.user.associationId);
    }
  }

  @Patch(':id/verify')
  @Roles('superadmin', 'president')
  @ApiOperation({ summary: 'Verify a payment (Admin/Super Admin only)' })
  verify(@Param('id') id: string, @Body() verifyDto: VerifyPaymentDto, @Request() req: any) {
    const role = req.user.roles.includes('superadmin') ? 'superadmin' : 'president';
    return this.paymentsService.verifyPayment(
      id,
      req.user.userId,
      role,
      verifyDto.status,
      verifyDto.reason
    );
  }
}
