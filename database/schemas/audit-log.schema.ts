import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ required: true })
  action!: string; // e.g., PAYMENT_APPROVED, PAYMENT_REJECTED, CAMP_UPLOAD

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  actorId!: Types.ObjectId;

  @Prop({ required: true })
  actorRole!: string;

  @Prop({ required: true })
  targetType!: string; // e.g., Payment, Camp, User

  @Prop({ type: Types.ObjectId, required: true })
  targetId!: Types.ObjectId;

  @Prop({ type: Object })
  metadata?: Record<string, any>; // e.g., { reason: '...', previousStatus: '...' }

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ actorId: 1 });
AuditLogSchema.index({ targetId: 1 });
AuditLogSchema.index({ createdAt: -1 });
