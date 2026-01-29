import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CampRegistrationsService } from './camp-registrations.service';
import { CampRegistrationsController } from './camp-registrations.controller';
import { CampRegistration, CampRegistrationSchema } from '../schemas/camp-registration.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CampRegistration.name, schema: CampRegistrationSchema }]),
    UsersModule,
  ],
  providers: [CampRegistrationsService],
  controllers: [CampRegistrationsController],
})
export class CampRegistrationsModule {}
