import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssociationsService } from './associations.service';
import { AssociationsController } from './associations.controller';
import { Organization, OrganizationSchema } from '../schemas/organization.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Organization.name, schema: OrganizationSchema }]),
  ],
  providers: [AssociationsService],
  controllers: [AssociationsController],
  exports: [AssociationsService],
})
export class AssociationsModule {}
