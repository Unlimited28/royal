import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CampsService } from './camps.service';
import { CampsController } from './camps.controller';
import { Camp, CampSchema } from '../schemas/camp.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Camp.name, schema: CampSchema }]),
  ],
  providers: [CampsService],
  controllers: [CampsController],
  exports: [CampsService],
})
export class CampsModule {}
