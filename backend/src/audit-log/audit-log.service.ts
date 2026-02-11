import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog } from '@schemas/audit-log.schema';
import type { AuditLogDocument } from '@schemas/audit-log.schema';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async recordAction(data: {
    action: string;
    actorId: string | Types.ObjectId;
    actorRole: string;
    targetType: string;
    targetId: string | Types.ObjectId;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const newLog = new this.auditLogModel({
      ...data,
      actorId: new Types.ObjectId(data.actorId),
      targetId: new Types.ObjectId(data.targetId),
    });
    return newLog.save();
  }

  async findAll(filter: any = {}) {
    return this.auditLogModel
      .find(filter)
      .populate('actorId', 'firstName lastName email userCode')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByTarget(targetType: string, targetId: string) {
    return this.auditLogModel
      .find({ targetType, targetId: new Types.ObjectId(targetId) })
      .populate('actorId', 'firstName lastName email userCode')
      .sort({ createdAt: -1 })
      .exec();
  }
}
