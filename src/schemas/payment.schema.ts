import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, enum: ['dues', 'exam', 'camp'] })
  type!: string;

  @Prop({ required: true })
  amount!: number;

  @Prop()
  receiptUrl?: string; // Cloud storage URL (optional for gateway payments)

  @Prop()
  transactionId?: string;

  @Prop()
  paymentUrl?: string;

  @Prop({ default: 'manual' })
  provider!: string;

  @Prop({ required: true })
  referenceNote!: string;

  @Prop({ default: 'pending', enum: ['pending', 'approved', 'rejected'] })
  status!: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  verifiedBy?: Types.ObjectId;

  @Prop()
  verifiedAt?: Date;

  @Prop()
  rejectionReason?: string;

  @Prop({ type: Object })
  fileMetadata?: Record<string, any>;

  @Prop({ default: false })
  isDeleted!: boolean;

  @Prop()
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  deletedBy?: Types.ObjectId;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ transactionId: 1 }, { sparse: true });
