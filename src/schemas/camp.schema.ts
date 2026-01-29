import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CampDocument = Camp & Document;

@Schema({ timestamps: true })
export class Camp {
  @Prop({ required: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  year!: number;

  @Prop({ required: true, enum: ['Annual Camp', 'Leadership Retreat', 'Youth Conference'] })
  type!: string;

  @Prop({ required: true })
  fee!: number;

  @Prop({ required: true })
  startDate!: Date;

  @Prop({ required: true })
  endDate!: Date;

  @Prop({ default: true })
  isActive!: boolean;
}

export const CampSchema = SchemaFactory.createForClass(Camp);
