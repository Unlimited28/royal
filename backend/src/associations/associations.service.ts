import { Injectable, NotFoundException } from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Association } from '@schemas/association.schema';
import type { AssociationDocument } from '@schemas/association.schema';
import { User } from '@schemas/user.schema';
import type { UserDocument } from '@schemas/user.schema';
import { OFFICIAL_ASSOCIATIONS } from '@constants';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class AssociationsService implements OnModuleInit {
  constructor(
    @InjectModel(Association.name) private associationModel: Model<AssociationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async onModuleInit() {
    await this.seedAssociations();
  }

  private async seedAssociations() {
    console.log('Checking associations...');
    for (const [index, name] of OFFICIAL_ASSOCIATIONS.entries()) {
      const exists = await this.associationModel.findOne({ name });
      if (!exists) {
        await this.associationModel.create({
          name,
          code: `ASSOC-${(index + 1).toString().padStart(2, '0')}`,
          type: 'association',
          status: 'active',
        });
      }
    }
    console.log('Associations check complete.');
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

  async updatePresident(associationId: string, presidentId: string, adminId?: string, adminRole?: string) {
    const association = await this.associationModel.findById(associationId);
    if (!association) throw new NotFoundException('Association not found');

    const previousPresidentId = association.president;

    // Explicitly deactivate the current President if exists
    if (previousPresidentId) {
        await this.userModel.findByIdAndUpdate(previousPresidentId, {
            status: 'inactive',
            isCurrentPresident: false,
            metadata: { demotedFrom: 'president', demotedAt: new Date() }
        });
    }

    // Ensure no other association has this new president
    await this.associationModel.updateMany(
      { president: presidentId },
      { $unset: { president: 1 } }
    );

    // Ensure this user is not marked as president elsewhere
    await this.userModel.updateMany(
      { _id: presidentId },
      { isCurrentPresident: false }
    );

    association.president = presidentId as any;
    const updatedAssociation = await association.save();

    // Ensure the new president is active and marked as current
    await this.userModel.findByIdAndUpdate(presidentId, {
      status: 'active',
      isCurrentPresident: true,
      association: associationId
    });

    if (adminId && adminRole) {
      await this.auditLogService.recordAction({
        action: 'ASSOCIATION_PRESIDENT_TRANSFER',
        actorId: adminId,
        actorRole: adminRole,
        targetType: 'Association',
        targetId: associationId as any,
        metadata: {
          previousPresidentId,
          newPresidentId: presidentId,
        },
      });
    }

    return updatedAssociation;
  }
}
