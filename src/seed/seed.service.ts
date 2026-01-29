import { Injectable } from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';

import { Camp } from '../schemas/camp.schema';
import type { CampDocument } from '../schemas/camp.schema';
import { Notification } from '../schemas/notification.schema';
import type { NotificationDocument } from '../schemas/notification.schema';
import { User } from '../schemas/user.schema';
import type { UserDocument } from '../schemas/user.schema';
import { Blog } from '../schemas/blog.schema';
import { GalleryItem } from '../schemas/gallery.schema';
import { Announcement } from '../schemas/announcement.schema';
import { HomepageSection } from '../schemas/homepage-section.schema';
import { Payment } from '../schemas/payment.schema';
import { Exam } from '../schemas/exam.schema';
import { Question } from '../schemas/question.schema';
import { Role } from '../schemas/role.schema';
import { Association } from '../schemas/association.schema';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectModel(Camp.name) private campModel: Model<CampDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Blog.name) private blogModel: Model<any>,
    @InjectModel(GalleryItem.name) private galleryModel: Model<any>,
    @InjectModel(Announcement.name) private announcementModel: Model<any>,
    @InjectModel(HomepageSection.name) private sectionModel: Model<any>,
    @InjectModel(Payment.name) private paymentModel: Model<any>,
    @InjectModel(Exam.name) private examModel: Model<any>,
    @InjectModel(Question.name) private questionModel: Model<any>,
    @InjectModel(Role.name) private roleModel: Model<any>,
    @InjectModel(Association.name) private associationModel: Model<any>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    if (this.configService.get('DISABLE_SEEDING') === 'true') return;

    // Only seed if Users is empty (indicating a fresh DB)
    const userCount = await this.userModel.countDocuments();
    if (userCount > 0) return;

    console.log('Seeding Phase 3 platform data...');

    await this.seedCamps();
    await this.seedContent();
    await this.seedHomepage();

    console.log('Platform seeding complete.');
  }

  private async seedCamps() {
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
    console.log(`Seeded ${camps.length} camps.`);
  }

  private async seedHomepage() {
    const sections = [
      {
        key: 'hero',
        title: 'Empowering the Next Generation',
        content: '# Welcome to OGBC RA\nJoin a community of dedicated youth ambassadors making a difference.',
        isActive: true,
      },
      {
        key: 'mission',
        title: 'Our Mission',
        content: 'To foster leadership, spiritual growth, and community service among youth.',
        isActive: true,
      }
    ];
    await this.sectionModel.insertMany(sections);
    console.log(`Seeded ${sections.length} homepage sections.`);
  }

  private async seedContent() {
    // We need at least one user (admin) to be the author
    // Assuming Roles and Associations are already seeded by their respective OnModuleInit or we seed them here
    let admin = await this.userModel.findOne({ email: 'admin@ogbcra.org' });
    if (!admin) {
        // Create a mock admin if not exists
        const superadminRole = await this.roleModel.findOne({ slug: 'superadmin' });
        const assoc = await this.associationModel.findOne();
        if (superadminRole && assoc) {
            admin = await this.userModel.create({
                email: 'admin@ogbcra.org',
                password: 'password123', // Will be hashed by hook
                firstName: 'System',
                lastName: 'Admin',
                userCode: 'RA/ADMIN/0001',
                roles: [superadminRole._id],
                association: assoc._id,
                status: 'active',
            });
        }
    }

    if (admin) {
        const blogs = [
            {
                title: 'Phase 3 Launch',
                slug: 'phase-3-launch',
                content: 'We are excited to announce the launch of Phase 3!',
                authorId: admin._id,
                status: 'published',
                publishedAt: new Date(),
            },
            {
                title: 'Demo Draft',
                slug: 'demo-draft',
                content: 'This is a draft blog.',
                authorId: admin._id,
                status: 'draft',
            }
        ];
        await this.blogModel.insertMany(blogs);

        const gallery = [
            {
                title: 'Convention 2024 Highlight',
                description: 'Group photo from the annual convention.',
                eventTag: 'convention-2024',
                imageUrl: 'https://placehold.co/600x400?text=Convention+2024',
            }
        ];
        await this.galleryModel.insertMany(gallery);

        const announcements = [
            {
                title: 'System Update',
                content: 'The platform has been updated with new CMS features.',
                isGlobal: true,
                createdBy: admin._id,
            }
        ];
        await this.announcementModel.insertMany(announcements);

        console.log('Seeded Blogs, Gallery, and Announcements.');
    }
  }
}
