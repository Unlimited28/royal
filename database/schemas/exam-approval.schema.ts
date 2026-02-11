import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExamApprovalDocument = ExamApproval & Document;

@Schema({ timestamps: true })
export class ExamApproval {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ambassadorId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Association', required: true })
  associationId!: Types.ObjectId;

  @Prop({ required: true })
  currentRank!: string;

  @Prop({ required: true })
  nextRank!: string;

  @Prop({ default: 'pending', enum: ['pending', 'approved', 'rejected'] })
  status!: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;

  @Prop()
  approvedAt?: Date;

  @Prop()
  rejectionReason?: string;
}

export const ExamApprovalSchema = SchemaFactory.createForClass(ExamApproval);

ExamApprovalSchema.index({ ambassadorId: 1, nextRank: 1 }, { unique: true });
ExamApprovalSchema.index({ associationId: 1, status: 1 });
