import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CampsService } from './camps.service';
import { CampsController } from './camps.controller';
import { Camp, CampSchema } from '../schemas/camp.schema';
import { CampRegistration, CampRegistrationSchema } from '../schemas/camp-registration.schema';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Camp.name, schema: CampSchema },
      { name: CampRegistration.name, schema: CampRegistrationSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [CampsController],
  providers: [CampsService],
  exports: [CampsService],
})
export class CampsModule {}
