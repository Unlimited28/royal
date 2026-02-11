import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '@schemas/user.schema';
import type { UserDocument } from '@schemas/user.schema';
import { Counter } from '@schemas/counter.schema';
import type { CounterDocument } from '@schemas/counter.schema';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Counter.name) private counterModel: Model<CounterDocument>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async generateUserCode(): Promise<string> {
    const key = 'global_user_id';
    const counter = await this.counterModel.findOneAndUpdate(
      { key },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );

    const idStr = counter.seq.toString().padStart(4, '0');
    return `RA/OGBC/${idStr}`;
  }

  async create(userData: any): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email: userData.email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    if (!userData.userCode) {
      userData.userCode = await this.generateUserCode();
    }

    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  async findByEmail(identifier: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { userCode: identifier.toUpperCase() }
      ]
    }).select('+password').exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).populate('association').exec();
  }

  async update(id: string, updateData: any): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async updateWithScore(id: string, updateData: any): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async findAll() {
    return this.userModel.find().populate('association').exec();
  }

  async changeRole(id: string, roleIds: string[], adminId: string, adminRole: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const previousRoles = user.roles;
    user.roles = roleIds.map(rid => new Types.ObjectId(rid)) as any;
    await user.save();

    await this.auditLogService.recordAction({
      action: 'USER_ROLE_CHANGE',
      actorId: adminId,
      actorRole: adminRole,
      targetType: 'User',
      targetId: id,
      metadata: { previousRoles, newRoles: roleIds },
    });

    return user;
  }

  async updateUserStatus(id: string, status: string, adminId: string, adminRole: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const previousStatus = user.status;
    user.status = status;
    await user.save();

    await this.auditLogService.recordAction({
      action: 'USER_STATUS_CHANGE',
      actorId: adminId,
      actorRole: adminRole,
      targetType: 'User',
      targetId: id,
      metadata: { previousStatus, newStatus: status },
    });

    return user;
  }

  async adminResetPassword(id: string, newPass: string, adminId: string, adminRole: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');

    user.password = newPass;
    await user.save();

    await this.auditLogService.recordAction({
      action: 'USER_PASSWORD_RESET_ADMIN',
      actorId: adminId,
      actorRole: adminRole,
      targetType: 'User',
      targetId: id,
    });

    return { message: 'Password reset successful' };
  }
}
