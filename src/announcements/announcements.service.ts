import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Announcement } from '../schemas/announcement.schema';
import type { AnnouncementDocument } from '../schemas/announcement.schema';
import { AnnouncementRead } from '../schemas/announcement-read.schema';
import type { AnnouncementReadDocument } from '../schemas/announcement-read.schema';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto/announcement.dto';
import { sanitizeMarkdown } from '../utils/sanitizer';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectModel(Announcement.name) private announcementModel: Model<AnnouncementDocument>,
    @InjectModel(AnnouncementRead.name) private readModel: Model<AnnouncementReadDocument>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(createDto: CreateAnnouncementDto, createdBy: string) {
    createDto.content = sanitizeMarkdown(createDto.content);
    const announcement = new this.announcementModel({
      ...createDto,
      createdBy: new Types.ObjectId(createdBy),
      targetRoles: createDto.targetRoles?.map(id => new Types.ObjectId(id)),
      targetAssociationId: createDto.targetAssociationId ? new Types.ObjectId(createDto.targetAssociationId) : undefined,
    });
    return announcement.save();
  }

  async findAllAdmin() {
    return this.announcementModel.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'firstName lastName')
      .exec();
  }

  async findForUser(userId: string, roles: string[], associationId: string) {
    const now = new Date();
    const roleObjectIds = roles.map(r => new Types.ObjectId(r));

    const announcements = await this.announcementModel.find({
      isActive: true,
      $or: [
        { isGlobal: true },
        { targetAssociationId: new Types.ObjectId(associationId) },
        { targetRoles: { $in: roleObjectIds } }
      ],
      expiresAt: { $not: { $lt: now } }
    }).sort({ createdAt: -1 }).exec();

    const readLogs = await this.readModel.find({
      userId: new Types.ObjectId(userId),
      announcementId: { $in: announcements.map(a => a._id) }
    }).exec();

    const readIds = new Set(readLogs.map(log => log.announcementId.toString()));
    return announcements.filter(a => !readIds.has(a._id.toString()));
  }

  async markAsRead(announcementId: string, userId: string) {
    const announcement = await this.announcementModel.findById(announcementId);
    if (!announcement) throw new NotFoundException('Announcement not found');

    return this.readModel.findOneAndUpdate(
      { announcementId: new Types.ObjectId(announcementId), userId: new Types.ObjectId(userId) },
      { readAt: new Date() },
      { upsert: true, new: true }
    );
  }

  async update(id: string, updateDto: UpdateAnnouncementDto) {
    if (updateDto.content) {
      updateDto.content = sanitizeMarkdown(updateDto.content);
    }
    const announcement = await this.announcementModel.findById(id);
    if (!announcement) throw new NotFoundException('Announcement not found');

    const updateData: any = { ...updateDto };
    if (updateDto.targetRoles) {
      updateData.targetRoles = updateDto.targetRoles.map(rid => new Types.ObjectId(rid));
    }
    if (updateDto.targetAssociationId) {
      updateData.targetAssociationId = new Types.ObjectId(updateDto.targetAssociationId);
    }

    Object.assign(announcement, updateData);
    return announcement.save();
  }

  async remove(id: string, adminId: string, adminRole: string) {
    const announcement = await this.announcementModel.findById(id);
    if (!announcement) throw new NotFoundException('Announcement not found');

    const result = await this.announcementModel.findByIdAndDelete(id);
    await this.auditLogService.recordAction({
      action: 'ANNOUNCEMENT_DELETE',
      actorId: adminId,
      actorRole: adminRole,
      targetType: 'Announcement',
      targetId: id,
      metadata: { title: announcement.title },
    });
    return result;
  }
}
