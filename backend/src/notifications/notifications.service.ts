import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from '@schemas/notification.schema';
import type { NotificationDocument } from '@schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(data: {
    userId: string | Types.ObjectId;
    type: string;
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }) {
    const notification = new this.notificationModel({
      ...data,
      userId: new Types.ObjectId(data.userId),
    });
    return notification.save();
  }

  async findAllForUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.notificationModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const result = await this.notificationModel.findOneAndUpdate(
      { _id: new Types.ObjectId(notificationId), userId: new Types.ObjectId(userId) },
      { isRead: true },
      { new: true }
    );
    if (!result) throw new NotFoundException('Notification not found');
    return result;
  }

  async markAllAsRead(userId: string) {
    return this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true }
    );
  }

  async getUnreadCount(userId: string) {
    return this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    });
  }
}
