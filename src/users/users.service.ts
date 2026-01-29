import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../schemas/user.schema';
import type { UserDocument } from '../schemas/user.schema';
import { Counter } from '../schemas/counter.schema';
import type { CounterDocument } from '../schemas/counter.schema';
import { AuditLogService } from '../audit-log/audit-log.service';
import * as bcrypt from 'bcrypt';

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
    (newUser as any).completenessScore = this.calculateCompletenessScore(newUser);
    return newUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).populate('association').exec();
  }

  async update(id: string, updateData: any): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async findAll() {
    return this.userModel.find().populate('association').exec();
  }

  calculateCompletenessScore(user: UserDocument): number {
    let score = 0;
    const u = user as any;
    if (u.profileImage) score += 25;
    if (u.phone) score += 25;
    if (u.address) score += 15;
    if (u.church) score += 15;
    if (u.bio) score += 20;
    return score;
  }

  async updateWithScore(id: string, updateData: any): Promise<UserDocument | null> {
    const user = await this.userModel.findById(id);
    if (!user) return null;

    Object.assign(user, updateData);
    (user as any).completenessScore = this.calculateCompletenessScore(user);

    return user.save();
  }

  async changeRole(userId: string, newRoleIds: string[], adminId: string, adminRole: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const previousRoles = user.roles;
    user.roles = newRoleIds.map(rid => new Types.ObjectId(rid));
    await user.save();

    await this.auditLogService.recordAction({
      action: 'USER_ROLE_CHANGE',
      actorId: adminId,
      actorRole: adminRole,
      targetType: 'User',
      targetId: userId,
      metadata: { previousRoles, newRoles: newRoleIds },
    });
    return user;
  }

  async adminResetPassword(userId: string, newPassword: string, adminId: string, adminRole: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    await this.auditLogService.recordAction({
      action: 'USER_PASSWORD_RESET_ADMIN',
      actorId: adminId,
      actorRole: adminRole,
      targetType: 'User',
      targetId: userId,
    });
    return { message: 'Password reset successful' };
  }

  async updateUserStatus(userId: string, status: string, adminId: string, adminRole: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const previousStatus = user.status;
    user.status = status;
    await user.save();

    await this.auditLogService.recordAction({
      action: 'USER_STATUS_CHANGE',
      actorId: adminId,
      actorRole: adminRole,
      targetType: 'User',
      targetId: userId,
      metadata: { previousStatus, newStatus: status },
    });
    return user;
  }
}
