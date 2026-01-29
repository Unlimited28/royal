import { Injectable } from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Association } from '../schemas/association.schema';
import type { AssociationDocument } from '../schemas/association.schema';
import { OFFICIAL_ASSOCIATIONS } from '../constants/index';

@Injectable()
export class AssociationsService implements OnModuleInit {
  constructor(
    @InjectModel(Association.name) private associationModel: Model<AssociationDocument>,
  ) {}

  async onModuleInit() {
    await this.seedAssociations();
  }

  private async seedAssociations() {
    const count = await this.associationModel.countDocuments();
    if (count === 0) {
      console.log('Seeding associations...');
      const associations = OFFICIAL_ASSOCIATIONS.map((name, index) => ({
        name,
        code: `ASSOC-${(index + 1).toString().padStart(2, '0')}`,
        type: 'association',
        status: 'active',
      }));
      await this.associationModel.insertMany(associations);
      console.log(`Seeded ${associations.length} associations.`);
    }
  }

  async findAll() {
    return this.associationModel.find().populate('president', 'firstName lastName email').exec();
  }

  async findOne(id: string) {
    return this.associationModel.findById(id).populate('president', 'firstName lastName email').exec();
  }

  async findByName(name: string) {
    return this.associationModel.findOne({ name }).exec();
  }

  async updatePresident(associationId: string, presidentId: string) {
    // Ensure no other association has this president
    await this.associationModel.updateMany(
      { president: presidentId },
      { $unset: { president: 1 } }
    );

    return this.associationModel.findByIdAndUpdate(
      associationId,
      { president: presidentId },
      { new: true }
    );
  }
}
