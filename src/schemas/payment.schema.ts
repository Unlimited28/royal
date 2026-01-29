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

  @Prop({ required: true })
  receiptUrl!: string; // Cloud storage URL

  @Prop({ default: 'pending', enum: ['pending', 'approved', 'rejected'] })
  status!: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  verifiedBy?: Types.ObjectId;

  @Prop()
  verifiedAt?: Date;

  @Prop()
  rejectionReason?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
