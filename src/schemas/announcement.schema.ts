import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AnnouncementDocument = Announcement & Document;

@Schema({ timestamps: true })
export class Announcement {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Role' }], default: [] })
  targetRoles!: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Association', index: true })
  targetAssociationId?: Types.ObjectId;

  @Prop({ default: false, index: true })
  isGlobal!: boolean;

  @Prop({ index: true })
  expiresAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;

  @Prop({ default: true, index: true })
  isActive!: boolean;
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);
