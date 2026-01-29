import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePaymentDto, VerifyPaymentDto } from './dto/payment.dto';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('upload')
  @Roles('ambassador', 'president')
  @ApiOperation({ summary: 'Upload a payment receipt' })
  create(@Body() paymentData: CreatePaymentDto, @Request() req: any) {
    return this.paymentsService.create({
      ...paymentData,
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
}
