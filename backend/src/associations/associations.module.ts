import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssociationsService } from './associations.service';
import { AssociationsController } from './associations.controller';
import { Association, AssociationSchema } from '@schemas/association.schema';
import { User, UserSchema } from '@schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
        { name: Association.name, schema: AssociationSchema },
        { name: User.name, schema: UserSchema }
    ]),
  ],
  providers: [AssociationsService],
  controllers: [AssociationsController],
  exports: [AssociationsService],
})
export class AssociationsModule {}
