import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CorporateAd } from '@schemas/corporate-ad.schema';
import type { CorporateAdDocument } from '@schemas/corporate-ad.schema';
import type { CreateAdDto, UpdateAdDto } from './dto/ad.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class AdsService {
  constructor(
    @InjectModel(CorporateAd.name) private adModel: Model<CorporateAdDocument>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(adData: CreateAdDto, adminId?: string, adminRole?: string) {
    const newAd = new this.adModel(adData);
    const result = await newAd.save();

    if (adminId) {
        await this.auditLogService.recordAction({
          action: 'AD_CREATE',
          actorId: adminId,
          actorRole: adminRole || 'superadmin',
          targetType: 'CorporateAd',
          targetId: result._id as any,
          metadata: { title: result.title },
        });
    }

    return result;
  }

  async findAll() {
    return this.adModel.find().exec();
  }

  async findActive() {
    const now = new Date();
    return this.adModel.find({
      isActive: true,
      startDate: { $lte: now },
      expiryDate: { $gte: now }
    }).exec();
  }

  async findOne(id: string) {
    const ad = await this.adModel.findById(id).exec();
    if (!ad) throw new NotFoundException('Ad not found');
    return ad;
  }

  async update(id: string, updateData: UpdateAdDto, adminId?: string, adminRole?: string) {
    const result = await this.adModel.findByIdAndUpdate(id, updateData, { new: true }).exec();

    if (adminId && result) {
        await this.auditLogService.recordAction({
          action: 'AD_UPDATE',
          actorId: adminId,
          actorRole: adminRole || 'superadmin',
          targetType: 'CorporateAd',
          targetId: id,
          metadata: { title: result.title, updateData },
        });
    }

    return result;
  }

  async remove(id: string, adminId: string, adminRole: string) {
    const ad = await this.adModel.findById(id);
    if (!ad) throw new NotFoundException('Ad not found');

    const result = await this.adModel.findByIdAndDelete(id).exec();
    await this.auditLogService.recordAction({
      action: 'AD_DELETE',
      actorId: adminId,
      actorRole: adminRole,
      targetType: 'CorporateAd',
      targetId: id,
      metadata: { title: ad.title },
    });
    return result;
  }
}
