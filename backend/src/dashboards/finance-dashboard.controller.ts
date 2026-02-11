import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaymentsService } from '../payments/payments.service';

@ApiTags('Dashboards')
@Controller('dashboard/finance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin')
@ApiBearerAuth()
export class FinanceDashboardController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get finance-specific statistics' })
  async getStats() {
    return this.paymentsService.getStats();
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get all payments with filters' })
  async getPayments(
    @Query('status') status?: 'pending' | 'approved' | 'rejected',
    @Query('associationId') associationId?: string,
  ) {
    if (associationId) {
        // We might need a more flexible query in paymentsService
        return this.paymentsService.findByAssociation(associationId);
    }
    return this.paymentsService.findAll();
  }
}
