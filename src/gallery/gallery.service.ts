import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GalleryItem } from '../schemas/gallery.schema';
import type { GalleryItemDocument } from '../schemas/gallery.schema';
import { CreateGalleryItemDto, UpdateGalleryItemDto } from './dto/gallery.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class GalleryService {
  constructor(
    @InjectModel(GalleryItem.name) private galleryModel: Model<GalleryItemDocument>,
    private readonly auditLogService: AuditLogService,
  ) {}

  private normalizeTag(tag: string): string {
    return tag.toLowerCase().trim().replace(/\s+/g, '-');
  }

  async create(createDto: CreateGalleryItemDto, imageUrl: string, fileMetadata?: any) {
    const item = new this.galleryModel({
      ...createDto,
      eventTag: this.normalizeTag(createDto.eventTag),
      imageUrl,
      fileMetadata,
    });
    return item.save();
  }

  async findAll(query: { eventTag?: string; page?: number; limit?: number; search?: string }) {
    const { eventTag, page = 1, limit = 20, search } = query;
    const filter: any = {};
    if (eventTag) filter.eventTag = this.normalizeTag(eventTag);
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.galleryModel.find(filter)
        .sort({ uploadDate: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.galleryModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const item = await this.galleryModel.findById(id);
    if (!item) throw new NotFoundException('Gallery item not found');
    return item;
  }

  async update(id: string, updateDto: UpdateGalleryItemDto, imageUrl?: string, fileMetadata?: any) {
    const item = await this.galleryModel.findById(id);
    if (!item) throw new NotFoundException('Gallery item not found');

    if (updateDto.eventTag) {
      updateDto.eventTag = this.normalizeTag(updateDto.eventTag);
    }

    Object.assign(item, updateDto);
    if (imageUrl) {
      item.imageUrl = imageUrl;
      item.fileMetadata = fileMetadata;
    }

    return item.save();
  }

  async remove(id: string, adminId: string, adminRole: string) {
    const item = await this.galleryModel.findById(id);
    if (!item) throw new NotFoundException('Gallery item not found');

    const result = await this.galleryModel.findByIdAndDelete(id);
    await this.auditLogService.recordAction({
      action: 'GALLERY_DELETE',
      actorId: adminId,
      actorRole: adminRole,
      targetType: 'GalleryItem',
      targetId: id,
      metadata: { title: item.title },
    });
    return result;
  }

  async getTags() {
    return this.galleryModel.distinct('eventTag');
  }
}
