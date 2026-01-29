import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CampRegistrationDocument = CampRegistration & Document;

@Schema({ timestamps: true })
export class CampRegistration {
  @Prop({ type: Types.ObjectId, ref: 'Camp', required: true, index: true })
  campId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId?: Types.ObjectId;

  @Prop({ default: false })
  unmatched!: boolean;

  @Prop({ required: true, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'APPROVED' })
  status!: string;

  @Prop({ type: Types.ObjectId, ref: 'Association', required: true, index: true })
  associationId!: Types.ObjectId;

  @Prop({ required: true, enum: ['MANUAL', 'EXCEL_UPLOAD'], default: 'MANUAL' })
  source!: string;

  // Raw data from Excel for unmatched users or reconciliation
  @Prop({ type: Object })
  rawData?: {
    fullName: string;
    association: string;
    church: string;
    rank: string;
    userCode?: string;
    email?: string;
  };

  @Prop({ type: Types.ObjectId, ref: 'User' })
  registeredBy!: Types.ObjectId;
}

export const CampRegistrationSchema = SchemaFactory.createForClass(CampRegistration);

CampRegistrationSchema.index({ campId: 1, userId: 1 }, { unique: true, sparse: true });
