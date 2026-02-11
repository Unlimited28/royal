import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CampsService } from '../camps/camps.service';

@ApiTags('Dashboards')
@Controller('dashboard/camps')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin', 'president')
@ApiBearerAuth()
export class CampManagementController {
  constructor(private readonly campsService: CampsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get camps management overview' })
  async getOverview() {
    const camps = await this.campsService.findAllCamps();

    return {
      totalCamps: camps.length,
      activeCamps: camps.filter(c => c.isActive).length,
    };
  }
}
