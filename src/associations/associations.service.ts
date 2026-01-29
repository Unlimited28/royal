import { Injectable } from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization } from '../schemas/organization.schema';
import type { OrganizationDocument } from '../schemas/organization.schema';
import { OFFICIAL_ASSOCIATIONS } from '../constants/index';

@Injectable()
export class AssociationsService implements OnModuleInit {
  constructor(
    @InjectModel(Organization.name) private organizationModel: Model<OrganizationDocument>,
  ) {}

  async onModuleInit() {
    await this.seedAssociations();
  }

  private async seedAssociations() {
    const count = await this.organizationModel.countDocuments();
    if (count === 0) {
      console.log('Seeding associations...');
      const associations = OFFICIAL_ASSOCIATIONS.map((name, index) => ({
        name,
        code: `ASSOC-${(index + 1).toString().padStart(2, '0')}`,
        type: 'association',
        status: 'active',
      }));
      await this.organizationModel.insertMany(associations);
      console.log(`Seeded ${associations.length} associations.`);
    }
  }

  async findAll() {
    return this.organizationModel.find().populate('president', 'firstName lastName email').exec();
  }

  async findOne(id: string) {
    return this.organizationModel.findById(id).populate('president', 'firstName lastName email').exec();
  }

  async findByName(name: string) {
    return this.organizationModel.findOne({ name }).exec();
  }

  async updatePresident(associationId: string, presidentId: string) {
    // Ensure no other association has this president
    await this.organizationModel.updateMany(
      { president: presidentId },
      { $unset: { president: 1 } }
    );

    return this.organizationModel.findByIdAndUpdate(
      associationId,
      { president: presidentId },
      { new: true }
    );
  }
}
