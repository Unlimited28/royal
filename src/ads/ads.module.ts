import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdsService } from './ads.service';
import { AdsController } from './ads.controller';
import { CorporateAd, CorporateAdSchema } from '../schemas/corporate-ad.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CorporateAd.name, schema: CorporateAdSchema }]),
  ],
  providers: [AdsService],
  controllers: [AdsController],
})
export class AdsModule {}
