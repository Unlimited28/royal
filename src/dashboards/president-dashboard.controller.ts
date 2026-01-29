import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../schemas/user.schema';
import type { UserDocument } from '../schemas/user.schema';
import { PaymentsService } from '../payments/payments.service';

@ApiTags('Dashboards')
@Controller('dashboard/president')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('president')
@ApiBearerAuth()
export class PresidentDashboardController {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get association-level statistics' })
  async getStats(@Request() req: any) {
    const associationId = req.user.associationId;

    // Use MongoDB aggregation for efficient count
    const userCount = await this.userModel.countDocuments({
      association: new Types.ObjectId(associationId)
    });

    const paymentStats = await this.paymentsService.getStatsByAssociation(associationId);

    return {
      totalUsers: userCount,
      payments: paymentStats,
    };
  }

  @Get('users')
  @ApiOperation({ summary: 'Get users in association' })
  async getUsers(@Request() req: any) {
    const associationId = req.user.associationId;
    return this.userModel.find({
      association: new Types.ObjectId(associationId)
    }).exec();
  }
}
