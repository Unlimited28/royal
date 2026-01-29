import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CampDocument = Camp & Document;

@Schema({ timestamps: true })
export class Camp {
  @Prop({ required: true, unique: true })
  name!: string;

  @Prop({ required: true })
  startDate!: Date;

  @Prop({ required: true })
  endDate!: Date;

  @Prop()
  location?: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop()
  description?: string;
}

export const CampSchema = SchemaFactory.createForClass(Camp);

CampSchema.index({ isActive: 1 });
CampSchema.index({ startDate: 1 });
