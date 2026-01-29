/// <reference types="multer" />
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentsService } from './payments.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
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

  @Post('initiate')
  @Roles('ambassador', 'president')
  @UseInterceptors(FileInterceptor('receipt', RECEIPT_UPLOAD_OPTIONS))
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({ summary: 'Initiate a payment (Manual receipt or Gateway)' })
  async initiate(
    @Body() paymentData: CreatePaymentDto,
    @Request() req: any,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.paymentsService.create(paymentData, req.user.userId, file);
  }

  @Get('my')
  @Roles('ambassador', 'president')
  @ApiOperation({ summary: 'Get my payment history' })
  getMyPayments(@Request() req: any) {
    return this.paymentsService.findByUserId(req.user.userId);
  }

  @Post('verify-gateway/:transactionId')
  @Roles('ambassador', 'president')
  @ApiOperation({ summary: 'Verify a gateway payment' })
  verifyGateway(@Param('transactionId') transactionId: string) {
    return this.paymentsService.verifyGatewayPayment(transactionId);
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

  @Delete(':id')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Soft-delete a payment (Super Admin only)' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.paymentsService.softDelete(id, req.user.userId, req.user.roles[0]);
  }
}
