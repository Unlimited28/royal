import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GalleryItemDocument = GalleryItem & Document;

@Schema({ timestamps: true })
export class GalleryItem {
  @Prop({ required: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  imageUrl!: string;

  @Prop()
  category!: string;

  @Prop()
  eventTag?: string;
}

export const GalleryItemSchema = SchemaFactory.createForClass(GalleryItem);
