import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BlogDocument = Blog & Document;

@Schema({ timestamps: true })
export class Blog {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true, unique: true })
  slug!: string;

  @Prop({ required: true })
  content!: string;

  @Prop()
  excerpt?: string;

  @Prop()
  category!: string;

  @Prop()
  featuredImage?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId!: Types.ObjectId;

  @Prop({ default: 'draft', enum: ['draft', 'published', 'archived'] })
  status!: string;

  @Prop()
  publishedAt?: Date;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
