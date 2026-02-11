import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Announcement, type AnnouncementDocument } from '@schemas/announcement.schema';

@Injectable()
export class AnnouncementService {
  constructor(
    @InjectModel(Announcement.name) private announcementModel: Model<AnnouncementDocument>,
  ) {}

  async create(data: any, userId: string) {
    const announcement = new this.announcementModel({
      ...data,
      createdBy: new Types.ObjectId(userId),
    });
    return announcement.save();
  }

  async findAll(associationId?: string) {
    const filter = associationId
        ? { $or: [{ isGlobal: true }, { associationId: new Types.ObjectId(associationId) }] }
        : { isGlobal: true };
    return this.announcementModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async remove(id: string) {
    const result = await this.announcementModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Announcement not found');
    return { message: 'Announcement deleted' };
  }
}
