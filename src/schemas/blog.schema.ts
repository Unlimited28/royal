import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BlogDocument = Blog & Document;

@Schema({ timestamps: true })
export class Blog {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true, index: true })
  slug!: string;

  @Prop({ required: true })
  content!: string; // Markdown

  @Prop()
  coverImageUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId!: Types.ObjectId;

  @Prop({ required: true, enum: ['draft', 'published'], default: 'draft', index: true })
  status!: string;

  @Prop()
  publishedAt?: Date;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.index({ title: 'text', content: 'text' });
