import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ExamsService } from '../exams/exams.service';

@ApiTags('Dashboards')
@Controller('dashboard/exams')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin')
@ApiBearerAuth()
export class ExamsDashboardController {
  constructor(private readonly examsService: ExamsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get exams overview stats' })
  async getOverview() {
    const exams = await this.examsService.findAll();
    const results = await this.examsService.getResults();

    return {
      totalExams: exams.length,
      activeExams: exams.filter(e => e.isActive).length,
      totalResults: results.length,
      passRate: results.length > 0
        ? (results.filter(r => r.passed).length / results.length) * 100
        : 0,
    };
  }
}
