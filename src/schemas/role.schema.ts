import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type RoleDocument = Role & Document;

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: [String] })
  permissions: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' })
  organization: mongoose.Types.ObjectId;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

// Add index for name and organization for efficient queries
RoleSchema.index({ name: 1, organization: 1 });