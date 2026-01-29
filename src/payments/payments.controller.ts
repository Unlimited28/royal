import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, UseInterceptors, UploadedFile, Res, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentsService } from './payments.service';
import { ReceiptsService } from './receipts.service';
import { UsersService } from '../users/users.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePaymentDto, VerifyPaymentDto } from './dto/payment.dto';
import { FilesService } from '../files/files.service';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly receiptsService: ReceiptsService,
    private readonly usersService: UsersService,
  ) {}

  @Post('upload')
  @Roles('ambassador', 'president')
  @UseInterceptors(FileInterceptor('receipt', {
    storage: FilesService.getStorageOptions('receipts'),
    fileFilter: FilesService.fileFilter(['image/jpeg', 'image/png', 'application/pdf']),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['dues', 'exam', 'camp'] },
        amount: { type: 'number' },
        receipt: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a payment receipt' })
  create(
    @Body() paymentData: CreatePaymentDto,
    @UploadedFile() file: any,
    @Request() req: any
  ) {
    const receiptUrl = file ? `/uploads/receipts/${file.filename}` : (paymentData.receiptUrl as string);

    if (!receiptUrl) {
      throw new BadRequestException('Receipt URL or file is required');
    }

    return this.paymentsService.create({
      ...paymentData,
      receiptUrl,
      userId: req.user.userId,
    });
  }

  @Get('my')
  @Roles('ambassador', 'president')
  @ApiOperation({ summary: 'Get my payment history' })
  getMyPayments(@Request() req: any) {
    return this.paymentsService.findByUserId(req.user.userId);
  }

  @Get()
  @Roles('superadmin')
  @ApiOperation({ summary: 'Get all payments (Super Admin only)' })
  findAll() {
    return this.paymentsService.findAll();
  }

  @Patch(':id/verify')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Verify a payment (Super Admin only)' })
  verify(@Param('id') id: string, @Body() verifyDto: VerifyPaymentDto, @Request() req: any) {
    return this.paymentsService.verifyPayment(id, req.user.userId, verifyDto.status, verifyDto.reason);
  }

  @Get(':id/receipt')
  @ApiOperation({ summary: 'Download PDF receipt for a payment' })
  async downloadReceipt(@Param('id') id: string, @Res() res: Response) {
    const payment = await this.paymentsService.findOne(id);
    const user = await this.usersService.findById(payment.userId.toString());
    return this.receiptsService.generateReceipt(payment, user, res);
  }
}
