import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '@schemas/user.schema';
import type { UserDocument } from '@schemas/user.schema';
import { PaymentsService } from '../payments/payments.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { RolesService } from '../roles/roles.service';
import { AdsService } from '../ads/ads.service';

@ApiTags('Dashboards')
@Controller('dashboard/superadmin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin')
@ApiBearerAuth()
export class SuperAdminDashboardController {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly paymentsService: PaymentsService,
    private readonly auditLogService: AuditLogService,
    private readonly rolesService: RolesService,
    private readonly adsService: AdsService,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get system-wide statistics' })
  async getStats() {
    const totalUsers = await this.userModel.countDocuments();
    const paymentStats = await this.paymentsService.getStats();

    // Pending presidents (users with role 'president' and status 'pending')
    const presidentRole = await this.rolesService.findBySlug('president');
    const pendingPresidents = presidentRole
        ? await this.userModel.countDocuments({ roles: presidentRole._id, status: 'pending' })
        : 0;

    const activeAds = await this.adsService.findActive();

    return {
      totalUsers,
      payments: paymentStats,
      pendingPresidentsCount: pendingPresidents,
      activeAdsCount: activeAds.length,
    };
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get system audit logs' })
  async getAuditLogs() {
    return this.auditLogService.findAll();
  }

  @Get('audit-logs/:targetType/:targetId')
  @ApiOperation({ summary: 'Get audit logs for a specific target' })
  async getTargetAuditLogs(@Param('targetType') type: string, @Param('targetId') id: string) {
    return this.auditLogService.findByTarget(type, id);
  }
}
