import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PresidentDashboardController } from './president-dashboard.controller';
import { SuperAdminDashboardController } from './superadmin-dashboard.controller';
import { AmbassadorDashboardController } from './ambassador-dashboard.controller';
import { FinanceDashboardController } from './finance-dashboard.controller';
import { ExamsDashboardController } from './exams-dashboard.controller';
import { CampManagementController } from './camp-management.controller';
import { UsersModule } from '../users/users.module';
import { PaymentsModule } from '../payments/payments.module';
import { CampsModule } from '../camps/camps.module';
import { ExamsModule } from '../exams/exams.module';
import { RolesModule } from '../roles/roles.module';
import { AdsModule } from '../ads/ads.module';
import { User, UserSchema } from '@schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
    PaymentsModule,
    CampsModule,
    ExamsModule,
    RolesModule,
    AdsModule,
  ],
  controllers: [
    PresidentDashboardController,
    SuperAdminDashboardController,
    AmbassadorDashboardController,
    FinanceDashboardController,
    ExamsDashboardController,
    CampManagementController,
  ],
})
export class DashboardsModule {}
