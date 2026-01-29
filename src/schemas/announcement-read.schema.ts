import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AnnouncementReadDocument = AnnouncementRead & Document;

@Schema({ timestamps: true })
export class AnnouncementRead {
  @Prop({ type: Types.ObjectId, ref: 'Announcement', required: true, index: true })
  announcementId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ default: Date.now })
  readAt!: Date;
}

export const AnnouncementReadSchema = SchemaFactory.createForClass(AnnouncementRead);

AnnouncementReadSchema.index({ announcementId: 1, userId: 1 }, { unique: true });
