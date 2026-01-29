import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { SystemSettingsController } from './system-settings.controller';
import { SystemSettingsService } from './system-settings.service';
import { SystemSetting, SystemSettingSchema } from '../schemas/system-setting.schema';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: SystemSetting.name, schema: SystemSettingSchema }]),
    CacheModule.register(),
    AuditLogModule,
  ],
  controllers: [SystemSettingsController],
  providers: [SystemSettingsService],
  exports: [SystemSettingsService],
})
export class SystemSettingsModule {}
