import { Injectable } from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Camp } from '../schemas/camp.schema';
import type { CampDocument } from '../schemas/camp.schema';
import { Notification } from '../schemas/notification.schema';
import type { NotificationDocument } from '../schemas/notification.schema';
import { User } from '../schemas/user.schema';
import type { UserDocument } from '../schemas/user.schema';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectModel(Camp.name) private campModel: Model<CampDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    await this.seedCamps();
    await this.seedNotifications();
  }

  private async seedCamps() {
    const count = await this.campModel.countDocuments();
    if (count === 0) {
      console.log('Seeding Phase 2 camps...');
      const camps = [
        {
          name: 'Annual Junior Camp 2025',
          startDate: new Date('2025-08-01'),
          endDate: new Date('2025-08-07'),
          location: 'Ogun State Conference Center',
          isActive: true,
          description: 'Yearly gathering for Junior Ambassadors.',
        },
        {
          name: 'Ambassadors Leadership Retreat 2025',
          startDate: new Date('2025-04-15'),
          endDate: new Date('2025-04-18'),
          location: 'Lagos Camp Ground',
          isActive: true,
          description: 'Leadership training for Senior Ambassadors.',
        },
      ];
      await this.campModel.insertMany(camps);
      console.log('Seeded camps.');
    }
  }

  private async seedNotifications() {
    const count = await this.notificationModel.countDocuments();
    if (count === 0) {
      const user = await this.userModel.findOne();
      if (user) {
        console.log('Seeding sample notifications...');
        const notifications = [
          {
            userId: user._id,
            type: 'system',
            title: 'Welcome to Phase 2',
            message: 'Operational workflows are now active. You can upload receipts and register for camps.',
            isRead: false,
          },
        ];
        await this.notificationModel.insertMany(notifications);
        console.log('Seeded notifications.');
      }
    }
  }
}
