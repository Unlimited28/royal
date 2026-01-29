import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CampRegistrationDocument = CampRegistration & Document;

@Schema({ timestamps: true })
export class CampRegistration {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Camp', required: true })
  campId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Payment' })
  paymentId?: Types.ObjectId;

  @Prop({ required: true, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' })
  status!: string;

  @Prop({ required: true, enum: ['individual', 'bulk'], default: 'individual' })
  registrationType!: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  uploadedBy?: Types.ObjectId; // For bulk registrations
}

export const CampRegistrationSchema = SchemaFactory.createForClass(CampRegistration);

CampRegistrationSchema.index({ userId: 1, campId: 1 }, { unique: true });
