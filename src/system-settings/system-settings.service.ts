import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { SystemSetting } from '../schemas/system-setting.schema';
import type { SystemSettingDocument } from '../schemas/system-setting.schema';
import { UpdateSystemSettingDto } from './dto/system-setting.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectModel(SystemSetting.name) private settingModel: Model<SystemSettingDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getSetting(key: string): Promise<any> {
    const cacheKey = `setting_${key}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached !== undefined && cached !== null) return cached;

    const setting = await this.settingModel.findOne({ key });
    if (!setting) {
      const defaults: Record<string, any> = {
        registrationEnabled: true,
        examEnabled: true,
        campRegistrationEnabled: true,
        gatewayPaymentEnabled: false,
      };
      return defaults[key];
    }

    await this.cacheManager.set(cacheKey, setting.value, 3600000);
    return setting.value;
  }

  async updateSetting(key: string, updateDto: UpdateSystemSettingDto, adminId?: string, adminRole?: string) {
    const previousSetting = await this.settingModel.findOne({ key });

    const setting = await this.settingModel.findOneAndUpdate(
      { key },
      { value: updateDto.value, description: updateDto.description },
      { upsert: true, new: true }
    );

    await this.cacheManager.del(`setting_${key}`);

    if (adminId && adminRole) {
      await this.auditLogService.recordAction({
        action: 'SYSTEM_SETTING_CHANGE',
        actorId: adminId,
        actorRole: adminRole,
        targetType: 'SystemSetting',
        targetId: key,
        metadata: { previousValue: previousSetting?.value, newValue: updateDto.value },
      });
    }

    return setting;
  }

  async findAll() {
    return this.settingModel.find().exec();
  }
}
