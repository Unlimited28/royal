import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GalleryItemDocument = GalleryItem & Document;

@Schema({ timestamps: true })
export class GalleryItem {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: true, trim: true, index: true })
  eventTag!: string; // Normalized (lowercase, trimmed)

  @Prop({ required: true })
  imageUrl!: string;

  @Prop({ type: Object })
  fileMetadata?: Record<string, any>;

  @Prop({ default: Date.now, index: true })
  uploadDate!: Date;
}

export const GalleryItemSchema = SchemaFactory.createForClass(GalleryItem);

GalleryItemSchema.index({ title: 'text', description: 'text', eventTag: 1 });
