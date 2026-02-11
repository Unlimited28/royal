import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Media } from '@schemas/media.schema';
import type { MediaDocument } from '@schemas/media.schema';
import type { CreateMediaDto, UpdateMediaDto } from './dto/media.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(Media.name) private mediaModel: Model<MediaDocument>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(mediaData: CreateMediaDto, adminId?: string, adminRole?: string) {
    const newMedia = new this.mediaModel(mediaData);
    const result = await newMedia.save();

    if (adminId) {
        await this.auditLogService.recordAction({
          action: 'MEDIA_CREATE',
          actorId: adminId,
          actorRole: adminRole || 'superadmin',
          targetType: 'Media',
          targetId: result._id as any,
          metadata: { title: result.title, type: result.type },
        });
    }

    return result;
  }

  async findAll(activeOnly = false) {
    const filter = activeOnly ? { isActive: true } : {};
    return this.mediaModel.find(filter).exec();
  }

  async findOne(id: string) {
    const media = await this.mediaModel.findById(id).exec();
    if (!media) throw new NotFoundException('Media not found');
    return media;
  }

  async update(id: string, updateData: UpdateMediaDto, adminId?: string, adminRole?: string) {
    const result = await this.mediaModel.findByIdAndUpdate(id, updateData, { new: true }).exec();

    if (adminId && result) {
        await this.auditLogService.recordAction({
          action: 'MEDIA_UPDATE',
          actorId: adminId,
          actorRole: adminRole || 'superadmin',
          targetType: 'Media',
          targetId: id,
          metadata: { title: result.title },
        });
    }

    return result;
  }

  async remove(id: string, adminId: string, adminRole: string) {
    const media = await this.mediaModel.findById(id);
    if (!media) throw new NotFoundException('Media not found');

    const result = await this.mediaModel.findByIdAndDelete(id).exec();

    await this.auditLogService.recordAction({
      action: 'MEDIA_DELETE',
      actorId: adminId,
      actorRole: adminRole,
      targetType: 'Media',
      targetId: id,
      metadata: { title: media.title },
    });

    return result;
  }
}
