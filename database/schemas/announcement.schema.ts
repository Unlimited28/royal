import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AnnouncementDocument = Announcement & Document;

@Schema({ timestamps: true })
export class Announcement {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ default: false })
  isGlobal!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Association' })
  associationId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;

  @Prop({ default: true })
  isActive!: boolean;
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);
