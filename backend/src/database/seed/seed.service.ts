import { Injectable, Logger } from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';

import { Camp } from '@schemas/camp.schema';
import type { CampDocument } from '@schemas/camp.schema';
import { Notification } from '@schemas/notification.schema';
import type { NotificationDocument } from '@schemas/notification.schema';
import { User } from '@schemas/user.schema';
import type { UserDocument } from '@schemas/user.schema';
import { Blog, type BlogDocument } from '@schemas/blog.schema';
import { GalleryItem, type GalleryItemDocument } from '@schemas/gallery.schema';
import { Announcement, type AnnouncementDocument } from '@schemas/announcement.schema';
import { HomepageSection, type HomepageSectionDocument } from '@schemas/homepage-section.schema';
import { Payment } from '@schemas/payment.schema';
import { Exam } from '@schemas/exam.schema';
import { Question } from '@schemas/question.schema';
import { Role } from '@schemas/role.schema';
import { Association } from '@schemas/association.schema';
import { CorporateAd } from '@schemas/corporate-ad.schema';
import { OFFICIAL_ASSOCIATIONS } from '../constants';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Camp.name) private campModel: Model<CampDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(GalleryItem.name) private galleryModel: Model<GalleryItemDocument>,
    @InjectModel(Announcement.name) private announcementModel: Model<AnnouncementDocument>,
    @InjectModel(HomepageSection.name) private sectionModel: Model<HomepageSectionDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<any>,
    @InjectModel(Exam.name) private examModel: Model<any>,
    @InjectModel(Question.name) private questionModel: Model<any>,
    @InjectModel(Role.name) private roleModel: Model<any>,
    @InjectModel(Association.name) private associationModel: Model<any>,
    @InjectModel(CorporateAd.name) private adModel: Model<any>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    if (this.configService.get('DISABLE_SEEDING') === 'true') return;

    // Run seeding in a way that doesn't block startup if it takes too long,
    // but we still want it to finish.
    this.seed().catch(err => {
      this.logger.error('Critical failure during seeding process:', err.stack);
    });
  }

  async seed() {
    this.logger.log('Starting Seeding process...');

    try {
      if (this.configService.get('CLEAR_DB') === 'true') {
          this.logger.warn('CLEAR_DB is true. Wiping collections...');
          await Promise.all([
            this.userModel.deleteMany({}),
            this.campModel.deleteMany({}),
            this.blogModel.deleteMany({}),
            this.galleryModel.deleteMany({}),
            this.announcementModel.deleteMany({}),
            this.paymentModel.deleteMany({}),
            this.examModel.deleteMany({}),
            this.questionModel.deleteMany({}),
            this.adModel.deleteMany({}),
            this.sectionModel.deleteMany({}),
            this.associationModel.deleteMany({}),
          ]);
      } else {
          // If not clearing, check if data already exists to avoid duplicates
          const userCount = await this.userModel.countDocuments();
          if (userCount > 0) {
              this.logger.log('Database already contains users. Skipping seed to prevent data corruption.');
              return;
          }
      }

      await this.seedRolesAndAssociations();
      await this.seedUsers();
      await this.seedCamps();
      await this.seedContent();
      await this.seedHomepage();
      await this.seedExams();
      await this.seedPayments();
      await this.seedAds();

      this.logger.log('Platform seeding complete.');
    } catch (error) {
      this.logger.error('Error during seeding:', error);
      throw error;
    }
  }

  private async seedRolesAndAssociations() {
    const roles = [
      { name: 'Ambassador', slug: 'ambassador', permissions: [] },
      { name: 'Association President', slug: 'president', permissions: [] },
      { name: 'Super Admin', slug: 'superadmin', permissions: [] },
      { name: 'Finance Officer', slug: 'finance', permissions: [] },
    ];

    for (const role of roles) {
      await this.roleModel.findOneAndUpdate({ slug: role.slug }, role, { upsert: true });
    }

    // Seed all official associations
    for (const name of OFFICIAL_ASSOCIATIONS) {
        const existing = await this.associationModel.findOne({ name });
        if (!existing) {
          await this.associationModel.create({
            name,
            code: name.substring(0, 3).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000),
            type: 'association',
            status: 'active',
            location: 'Ogun, Nigeria'
          });
        }
    }

    const assoc = await this.associationModel.findOneAndUpdate(
      { name: 'Ogun State Baptist Conference' },
      {
        name: 'Ogun State Baptist Conference',
        code: 'OGUN-ASSOC-01',
        type: 'association',
        status: 'active',
        location: 'Ogun, Nigeria'
      },
      { upsert: true, new: true }
    );

    this.logger.log('Seeded Roles and Primary Association.');
    return assoc;
  }

  private async seedUsers() {
    const adminRole = await this.roleModel.findOne({ slug: 'superadmin' });
    const presidentRole = await this.roleModel.findOne({ slug: 'president' });
    const ambassadorRole = await this.roleModel.findOne({ slug: 'ambassador' });
    const association = await this.associationModel.findOne();

    if (!adminRole || !presidentRole || !ambassadorRole || !association) {
      console.warn('Roles or Association missing, skipping user seeding');
      return;
    }

    await this.userModel.deleteMany({});

    const users = [
      {
        email: 'admin@ogbcra.org',
        password: 'adminaccess123',
        firstName: 'System',
        lastName: 'Admin',
        userCode: 'RA/ADMIN/0001',
        roles: [adminRole._id],
        association: association._id,
        status: 'active',
      },
      {
        email: 'president@ogbcra.org',
        password: 'presaccess123',
        firstName: 'Association',
        lastName: 'President',
        userCode: 'RA/PRES/0001',
        roles: [presidentRole._id],
        association: association._id,
        status: 'active',
        isCurrentPresident: true,
      },
      {
        email: 'ambassador@ogbcra.org',
        password: 'password123',
        firstName: 'John',
        lastName: 'Ambassador',
        userCode: 'RA/OGBC/0001',
        roles: [ambassadorRole._id],
        association: association._id,
        status: 'active',
        rank: 'Candidate',
      },
      {
        email: 'pending@ogbcra.org',
        password: 'password123',
        firstName: 'Pending',
        lastName: 'User',
        userCode: 'RA/OGBC/0002',
        roles: [ambassadorRole._id],
        association: association._id,
        status: 'pending',
      }
    ];

    for (const userData of users) {
      const exists = await this.userModel.findOne({ email: userData.email });
      if (!exists) {
        const user = await this.userModel.create(userData);
        if (userData.isCurrentPresident) {
          await this.associationModel.findByIdAndUpdate(association._id, { president: user._id });
        }
        console.log(`Created user: ${userData.email}`);
      }
    }
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

    for (const camp of camps) {
      await this.campModel.findOneAndUpdate({ name: camp.name }, camp, { upsert: true });
    }
    this.logger.log(`Seeded ${camps.length} camps.`);
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

    for (const section of sections) {
      await this.sectionModel.findOneAndUpdate({ key: section.key }, section, { upsert: true });
    }
    this.logger.log(`Seeded ${sections.length} homepage sections.`);
  }

  private async seedContent() {
    let admin = await this.userModel.findOne({ email: 'admin@ogbcra.org' });
    if (!admin) return;

    const blogs = [
        {
            title: 'Phase 4 Launch: Real Data Unification',
            slug: 'phase-4-launch',
            content: 'The Royal Ambassadors Digital Portal is now fully unified with the backend.',
            authorId: admin._id,
            status: 'published',
            publishedAt: new Date(),
        },
        {
            title: 'Welcome to the New Portal',
            slug: 'welcome-new-portal',
            content: 'We are excited to bring you a more secure and efficient way to manage RA activities.',
            authorId: admin._id,
            status: 'published',
            publishedAt: new Date(),
        }
    ];

    for (const blog of blogs) {
      await this.blogModel.findOneAndUpdate({ slug: blog.slug }, blog, { upsert: true });
    }

    const gallery = [
        {
            title: 'Convention 2024 Highlight',
            description: 'Group photo from the annual convention.',
            eventTag: 'convention-2024',
            imageUrl: 'https://placehold.co/600x400?text=Convention+2024',
        }
    ];

    for (const item of gallery) {
      await this.galleryModel.findOneAndUpdate({ title: item.title }, item, { upsert: true });
    }

    const announcements = [
        {
            title: 'System Fully Operational',
            content: 'Phase 4 integration is complete. All mocks have been removed.',
            isGlobal: true,
            createdBy: admin._id,
        }
    ];

    for (const ann of announcements) {
      await this.announcementModel.findOneAndUpdate({ title: ann.title }, ann, { upsert: true });
    }

    this.logger.log('Seeded Blogs, Gallery, and Announcements.');
  }

  private async seedExams() {
    const admin = await this.userModel.findOne({ email: 'admin@ogbcra.org' });
    if (!admin) return;

    const examData = {
      title: 'Member Rank Examination',
      description: 'First rank exam for new ambassadors.',
      targetRank: 'Assistant Intern',
      duration_minutes: 30,
      pass_score: 50,
      createdBy: admin._id,
      isActive: true,
    };

    let exam = await this.examModel.findOne({ title: examData.title });
    if (!exam) {
      exam = await this.examModel.create(examData);
    }

    const questions = [
      {
        examId: exam._id,
        text: 'What is the RA Motto?',
        options: [
          'Ambassadors for Christ',
          'Leaders of tomorrow',
          'Service to humanity',
          'Spiritual growth'
        ],
        correctAnswer: 0,
        points: 10,
      },
      {
        examId: exam._id,
        text: 'Which year was RA founded?',
        options: [
          '1900',
          '1908',
          '1950',
          '1960'
        ],
        correctAnswer: 1,
        points: 10,
      }
    ];

    const seededQuestions = [];
    for (const q of questions) {
      let question = await this.questionModel.findOne({ examId: q.examId, text: q.text });
      if (!question) {
        question = await this.questionModel.create(q);
      }
      seededQuestions.push(question);
    }

    exam.questions = seededQuestions.map((q: any) => q._id);
    await exam.save();

    this.logger.log('Seeded Exam with Questions.');
  }

  private async seedAds() {
    const ads = [
      {
        title: 'RA Convention 2025',
        imageUrl: 'https://placehold.co/400x200?text=Convention+2025',
        clickUrl: 'https://ogbcra.org/convention',
        placement: 'dashboard',
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      }
    ];

    for (const ad of ads) {
      await this.adModel.findOneAndUpdate({ title: ad.title }, ad, { upsert: true });
    }
    this.logger.log('Seeded Ads.');
  }

  private async seedPayments() {
    const ambassador = await this.userModel.findOne({ email: 'ambassador@ogbcra.org' });
    if (!ambassador) return;

    const payments = [
      {
        userId: ambassador._id,
        type: 'dues',
        amount: 5000,
        receiptUrl: 'https://placehold.co/400x600?text=Receipt+Sample',
        referenceNote: 'Annual dues for 2024',
        status: 'pending',
      },
      {
        userId: ambassador._id,
        type: 'exam',
        amount: 1000,
        receiptUrl: 'https://placehold.co/400x600?text=Receipt+Exam',
        referenceNote: 'Exam fee for Member rank',
        status: 'approved',
        verifiedAt: new Date(),
      }
    ];

    for (const p of payments) {
      const exists = await this.paymentModel.findOne({
        userId: p.userId,
        type: p.type,
        referenceNote: p.referenceNote
      });
      if (!exists) {
        await this.paymentModel.create(p);
      }
    }
    this.logger.log('Seeded Payments.');
  }
}
