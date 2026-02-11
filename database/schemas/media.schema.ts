import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MediaDocument = Media & Document;

@Schema({ timestamps: true })
export class Media {
  @Prop({ required: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  url!: string; // YouTube, Facebook, etc.

  @Prop({ required: true, enum: ['video', 'document', 'other'] })
  type!: string;

  @Prop()
  thumbnailUrl?: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
