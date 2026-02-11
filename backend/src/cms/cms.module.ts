import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from '@schemas/blog.schema';
import { GalleryItem, GalleryItemSchema } from '@schemas/gallery.schema';
import { Announcement, AnnouncementSchema } from '@schemas/announcement.schema';
import { HomepageSection, HomepageSectionSchema } from '@schemas/homepage-section.schema';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { GalleryService } from './gallery.service';
import { GalleryController } from './gallery.controller';
import { AnnouncementService } from './announcement.service';
import { AnnouncementController } from './announcement.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: GalleryItem.name, schema: GalleryItemSchema },
      { name: Announcement.name, schema: AnnouncementSchema },
      { name: HomepageSection.name, schema: HomepageSectionSchema },
    ]),
  ],
  controllers: [BlogController, GalleryController, AnnouncementController],
  providers: [BlogService, GalleryService, AnnouncementService],
  exports: [MongooseModule, BlogService, GalleryService, AnnouncementService],
})
export class CMSModule {}
