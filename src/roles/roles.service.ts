import { Injectable } from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../schemas/role.schema';
import type { RoleDocument } from '../schemas/role.schema';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
  }

  private async seedRoles() {
    const count = await this.roleModel.countDocuments();
    if (count === 0) {
      console.log('Seeding roles...');
      const roles = [
        { name: 'Ambassador', slug: 'ambassador', isSystemRole: true, permissions: ['read:own_data', 'take:exam'] },
        { name: 'Association President', slug: 'president', isSystemRole: true, permissions: ['read:association_data', 'approve:exam'] },
        { name: 'Super Admin', slug: 'superadmin', isSystemRole: true, permissions: ['manage:all'] },
      ];
      await this.roleModel.insertMany(roles);
      console.log('Seeded roles.');
    }
  }

  async findBySlug(slug: string) {
    return this.roleModel.findOne({ slug }).exec();
  }

  async findByIds(ids: any[]) {
    return this.roleModel.find({ _id: { $in: ids } }).exec();
  }
}
