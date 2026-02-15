import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeedService } from './seed.service';
import { Camp, CampSchema } from '@schemas/camp.schema';
import { Notification, NotificationSchema } from '@schemas/notification.schema';
import { User, UserSchema } from '@schemas/user.schema';
import { Blog, BlogSchema } from '@schemas/blog.schema';
import { GalleryItem, GalleryItemSchema } from '@schemas/gallery.schema';
import { Announcement, AnnouncementSchema } from '@schemas/announcement.schema';
import { HomepageSection, HomepageSectionSchema } from '@schemas/homepage-section.schema';
import { Payment, PaymentSchema } from '@schemas/payment.schema';
import { Exam, ExamSchema } from '@schemas/exam.schema';
import { Question, QuestionSchema } from '@schemas/question.schema';
import { Role, RoleSchema } from '@schemas/role.schema';
import { Association, AssociationSchema } from '@schemas/association.schema';
import { CorporateAd, CorporateAdSchema } from '@schemas/corporate-ad.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL') || 'mongodb://localhost:27017/ogbc_ra',
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Camp.name, schema: CampSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: GalleryItem.name, schema: GalleryItemSchema },
      { name: Announcement.name, schema: AnnouncementSchema },
      { name: HomepageSection.name, schema: HomepageSectionSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Exam.name, schema: ExamSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Association.name, schema: AssociationSchema },
      { name: CorporateAd.name, schema: CorporateAdSchema },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
