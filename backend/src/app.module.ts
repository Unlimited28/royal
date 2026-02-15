import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AssociationsModule } from './associations/associations.module';
import { RolesModule } from './roles/roles.module';
import { ExamsModule } from './exams/exams.module';
import { AdsModule } from './ads/ads.module';
import { MediaModule } from './media/media.module';
import { PaymentsModule } from './payments/payments.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StorageModule } from './common/storage/storage.module';
import { CampsModule } from './camps/camps.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { CMSModule } from './cms/cms.module';
import { SeedModule } from '@seed/seed.module';
import { HealthModule } from './health/health.module';
import { LoggerMiddleware } from './common/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL') || 'mongodb://localhost:27017/ogbc_ra',
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    // Modules will be added here
    AuthModule,
    UsersModule,
    AssociationsModule,
    RolesModule,
    ExamsModule,
    AdsModule,
    MediaModule,
    PaymentsModule,
    AuditLogModule,
    NotificationsModule,
    StorageModule,
    CampsModule,
    DashboardsModule,
    CMSModule,
    SeedModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
