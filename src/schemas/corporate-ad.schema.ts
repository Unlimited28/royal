import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CorporateAdDocument = CorporateAd & Document;

@Schema({ timestamps: true })
export class CorporateAd {
  @Prop({ required: true })
  imageUrl!: string;

  @Prop({ required: true })
  clickUrl!: string;

  @Prop({ required: true, enum: ['homepage', 'dashboard', 'public'] })
  placement!: string;

  @Prop({ required: true })
  startDate!: Date;

  @Prop({ required: true })
  expiryDate!: Date;

  @Prop({ default: true })
  isActive!: boolean;
}

export const CorporateAdSchema = SchemaFactory.createForClass(CorporateAd);
