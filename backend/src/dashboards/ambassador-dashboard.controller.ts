import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ExamsService } from '../exams/exams.service';
import { PaymentsService } from '../payments/payments.service';
import { CampsService } from '../camps/camps.service';

@ApiTags('Dashboards')
@Controller('dashboard/ambassador')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ambassador')
@ApiBearerAuth()
export class AmbassadorDashboardController {
  constructor(
    private readonly examsService: ExamsService,
    private readonly paymentsService: PaymentsService,
    private readonly campsService: CampsService,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get ambassador personal statistics' })
  async getStats(@Request() req: any) {
    const userId = req.user.userId;

    const [results, payments, registrations] = await Promise.all([
      this.examsService.getResults(userId),
      this.paymentsService.findByUserId(userId),
      this.campsService.getRegistrationsByUser(userId),
    ]);

    // Sort and take the 5 most recent results
    const recentResults = [...results]
      .sort((a, b) => (b as any).createdAt.getTime() - (a as any).createdAt.getTime())
      .slice(0, 5);

    return {
      examsCount: results.length,
      examsPassed: results.filter(r => r.passed).length,
      paymentsCount: payments.length,
      campsCount: registrations.length,
      recentResults,
    };
  }
}
