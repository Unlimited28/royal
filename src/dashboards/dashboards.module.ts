import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PresidentDashboardController } from './president-dashboard.controller';
import { SuperAdminDashboardController } from './superadmin-dashboard.controller';
import { UsersModule } from '../users/users.module';
import { PaymentsModule } from '../payments/payments.module';
import { CampsModule } from '../camps/camps.module';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
    PaymentsModule,
    CampsModule
  ],
  controllers: [PresidentDashboardController, SuperAdminDashboardController],
})
export class DashboardsModule {}
