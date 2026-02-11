import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HomepageSectionDocument = HomepageSection & Document;

@Schema({ timestamps: true })
export class HomepageSection {
  @Prop({ required: true, unique: true })
  key!: string; // e.g., 'hero', 'about', 'mission'

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop()
  imageUrl?: string;
}

export const HomepageSectionSchema = SchemaFactory.createForClass(HomepageSection);
