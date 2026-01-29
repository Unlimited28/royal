import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { HomepageSection, HomepageSectionSchema } from '../schemas/homepage-section.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: HomepageSection.name, schema: HomepageSectionSchema }]),
  ],
  controllers: [PublicController],
  providers: [PublicService],
  exports: [PublicService],
})
export class PublicModule {}
