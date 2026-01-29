import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HomepageSectionDocument = HomepageSection & Document;

@Schema({ timestamps: true })
export class HomepageSection {
  @Prop({ required: true, unique: true, trim: true })
  key!: string; // hero, mission, vision, footer, etc.

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true })
  content!: string; // Markdown

  @Prop({ default: true, index: true })
  isActive!: boolean;
}

export const HomepageSectionSchema = SchemaFactory.createForClass(HomepageSection);
